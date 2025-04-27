import Expense from "../model/expense.model.js";
import { v2 as cloudinary } from "cloudinary";
import group from "../model/group.model.js";

const getUserExpenses = async (req,res) => {
  try {
    const {id} = req.user;
    const expenses = await Expense.find({userId : id});
    if(!expenses) return res.status(404).json({message : "No expenses found"});
    return res.status(200).json({message : "Expenses fetched successfully",expenses});
  }
  catch (error) {
    return res.status(500).json({message : "Internal server error",error});
  }
}

const addExpense = async (req,res) => {
  try {
    const {id} = req.user;
    const {title,amount,participants,groupId,category}= req.body;
    if(!title || !amount || !participants) return res.status(400).json({message : "Please provide all the fields"});
    const isGroupExpense = groupId ? true : false;

    let reciept = null;
    if(req.file && req.file.buffer) {
      const fileStr = req.file.buffer.toString('base64');
      const fileFormat = `data:${req.file.mimetype};base64,${fileStr}`;


      const uploadResult = await cloudinary.uploader.upload(fileFormat, {
        folder: 'expenses',
        resource_type: 'auto'
      });
      if(!uploadResult) return res.status(400).json({message : "Error in uploading file"});
      reciept = uploadResult.secure_url;
    }
    
    const expense = await Expense.create({title,amount,senderId : id,participants,groupId,isGroupExpense,category,reciept});
    if(isGroupExpense){
      const groupDoc = await group.findById(groupId);
      groupDoc.totalExpense += amount;
      groupDoc.expense.push(expense._id);
      await groupDoc.save();
    }
    if(!expense) return res.status(400).json({message : "Error in creating expense"});
    return res.status(201).json({message : "Expense created successfully",expense});
  } catch (error) {
    return res.status(500).json({message : "Internal server error",error});
  }
}

const updateExpense = async (req,res) => {
  try {
    const {id} = req.user;
    const {title,amount,participants,groupId,category} = req.body;
    const {expenseId} = req.params;
    if(!title || !amount || !participants) return res.status(400).json({message : "Please provide all the fields"});
    const expense = await Expense.findById(expenseId);
    if(!expense) return res.status(404).json({message : "Expense not found"});
    if(expense.senderId.toString() !== id) return res.status(403).json({message : "You are not authorized to update this expense"});
    const people = participants.map(person => {
      if(!person.userId || !person.share) {
        throw new Error("Invalid participant data");
      }
      return {
        userId: person.userId,
        share: Number(person.share),
        isSettled: person.isSettled || false,
        transactionId: person.transactionId || null,
      };
    });
     const totalShares = people.reduce((sum, person) => sum + person.share, 0);
     if(totalShares !== amount) {
       return res.status(400).json({
         message: "Sum of shares must equal total amount"
       });
     }
    const updatedExpense = await Expense.findByIdAndUpdate(expenseId,{title,amount,people,groupId,category},{new : true});

    if(!updatedExpense) return res.status(400).json({message : "Error in updating expense"});
    return res.status(200).json({message : "Expense updated successfully",updatedExpense});
  } catch (error) {
    return res.status(500).json({message : "Internal server error",error});
  }
}

const getExpenseSummary = async (req, res) => {
  try {
    const { amount, participants, senderId } = req.body;

    // Validate input
    if (!amount || !Array.isArray(participants) || participants.length === 0 || !senderId) {
      return res.status(400).json({ message: "Invalid request body" });
    }

    // Validate total shares equal amount
    const totalShares = participants.reduce((sum, person) => sum + person.share, 0);
    if (totalShares !== amount) {
      return res.status(400).json({ message: "Sum of shares must equal total amount" });
    }

    // Prepare participants summary
    const participantSummary = participants.map(person => ({
      userId: person.user,
      share: person.share,
      isSettled: person.isSettled,
      transactionId: person.transactionId
    }));

    // Total amount the sender should receive
    const totalAmountOwedToSender = participants.reduce((sum, person) => sum + person.share, 0);

    return res.status(200).json({
      totalAmount: amount,
      senderId: senderId,
      totalAmountOwedToSender: totalAmountOwedToSender,
      participants: participantSummary
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server Error" });
  }
};

const filterExpenses = async (req,res) => {
  try {
    const { timePeriod, date, type } = req.query;
    const { id } = req.user;
    
    let query = { $or: [{ senderId: id }, { 'participants.userId': id }] };
    let dateFilter = {};

    // Handle time period filter
    if (timePeriod) {
      const now = new Date();
      switch (timePeriod) {
        case '30days':
          dateFilter = { createdAt: { $gte: new Date(now.setDate(now.getDate() - 30)) } };
          break;
        case '6months':
          dateFilter = { createdAt: { $gte: new Date(now.setMonth(now.getMonth() - 6)) } };
          break;
        case 'year':
          dateFilter = { createdAt: { $gte: new Date(now.setFullYear(now.getFullYear() - 1)) } };
          break;
      }
    }

    // Handle specific date filter
    if (date) {
      const selectedDate = new Date(date);
      const nextDay = new Date(selectedDate);
      nextDay.setDate(selectedDate.getDate() + 1);
      dateFilter = {
        createdAt: {
          $gte: selectedDate,
          $lt: nextDay
        }
      };
    }

    // Add date filter to query if exists
    if (Object.keys(dateFilter).length > 0) {
      query = { ...query, ...dateFilter };
    }

    // Handle expense type filter
    if (type) {
      switch (type) {
        case 'youowe':
          query = {
            'participants.userId': id,
            senderId: { $ne: id },
            'participants.isSettled': false
          };
          break;
        case 'owedtoyou':
          query = {
            senderId: id,
            'participants.isSettled': false
          };
          break;
        case 'settled':
          query = {
            $or: [
              { senderId: id },
              { 'participants.userId': id }
            ],
            'participants.isSettled': true
          };
          break;
      }
    }

    const expenses = await Expense.find(query)
      .sort({ createdAt: -1 })
      .populate('senderId', 'name email')
      .populate('participants.userId', 'name email');

    if (!expenses || expenses.length === 0) {
      return res.status(404).json({ message: "No expenses found matching the filters" });
    }

    return res.status(200).json({
      message: "Expenses fetched successfully",
      count: expenses.length,
      expenses
    });

  } catch (error) {
    console.error("Filter expenses error:", error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
}

const deleteExpense = async (req,res) => {
  try {
    const {id} = req.user;
    const {expenseId} = req.params;
    const expense = await Expense.findById(expenseId);
    if(!expense) return res.status(404).json({message : "Expense not found"});
    if(expense.senderId.toString() !== id) return res.status(403).json({message : "You are not authorized to delete this expense"});
    const isGroupExpense = expense.isGroupExpense;
    if(isGroupExpense) {
      const groupDoc = await group.findById(expense.groupId);
      if(!groupDoc) return res.status(404).json({message : "Group not found"});
      groupDoc.totalExpense -= expense.amount;
      groupDoc.expenses = groupDoc.expenses.filter(exp => exp.toString() !== expenseId);
      await groupDoc.save();
    }
    await Expense.findByIdAndDelete(expenseId);
    return res.status(200).json({message : "Expense deleted successfully"});
  } catch (error) {
    return res.status(500).json({message : "Internal server error",error});
  }
}

export { getUserExpenses, addExpense, updateExpense, getExpenseSummary, filterExpenses, deleteExpense };
