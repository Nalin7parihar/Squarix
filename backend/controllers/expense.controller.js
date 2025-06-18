import Expense from "../model/expense.model.js";
import { v2 as cloudinary } from "cloudinary";
import group from "../model/group.model.js";
import User from "../model/user.model.js";
const getUserExpenses = async (req,res) => {
  try {
    const {id} = req.user;
    const expenses = await Expense.find({
      $or: [
        { senderId: id },
        { 'participants.user': id }
      ]
    })
    .populate('senderId', 'name email') 
    .populate('participants.user', 'name email')
    .populate('groupId') // Include group information for group expenses
    .sort({ createdAt: -1 }); // Sort by creation date, newest first
    
    // Return empty array instead of 404 error when no expenses found
    return res.status(200).json({
      message: expenses.length > 0 ? "Expenses fetched successfully" : "No expenses found", 
      expenses: expenses || []
    });
  }
  catch (error) {
    console.error("Error fetching expenses:", error);
    return res.status(500).json({message: "Internal server error", error: error.message});
  }
}

const getExpenseById = async (req,res) => {
  try {
    const { expenseId } = req.params;
    const populatedExpense = await Expense.findById(expenseId)
      .populate('senderId', 'name email')
      .populate('participants.user', 'name email')
      .populate('groupId');
    return res.status(200).json({
      message: "Expense fetched successfully",
      expense: populatedExpense
    });

  } catch (error) {
    console.error("Error fetching expense by ID:", error);
    return res.status(500).json({message: "Internal server error", error: error.message});
  }
}

const addExpense = async (req,res) => {
  try {
    const {id} = req.user;
    const {title, amount, groupId, category, senderId} = req.body;
    let {participants} = req.body;
    
    if(!title || !amount || !participants) return res.status(400).json({message : "Please provide all the fields"});
    
    // Make sure participants is parsed if it's a string
    if(typeof participants === 'string') {
      participants = JSON.parse(participants);
    }
    
    // Validate participants structure
    if(!Array.isArray(participants)) {
      return res.status(400).json({message: "Participants must be an array"});
    }

    // Ensure each participant has a user and share property
    participants = participants.map(participant => {
      return {
        user: participant.user,
        share: parseFloat(participant.share),
        isSettled: participant.isSettled || false,
        transactionId: participant.transactionId || null
      };
    });

    // Validate total shares equal amount
    const totalShares = participants.reduce((sum, participant) => sum + participant.share, 0);
    if(Math.abs(totalShares - parseFloat(amount)) > 0.01) { // Allow small floating point differences
      return res.status(400).json({
        message: "Sum of shares must equal total amount"
      });
    }

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
    
    // Use the provided senderId if available, otherwise use the logged-in user's id
    const actualSenderId = senderId || id;
    
    const expense = await Expense.create({
      title,
      amount: parseFloat(amount),
      senderId: actualSenderId, // Use the determined sender ID
      participants,
      groupId,
      isGroupExpense,
      category,
      reciept
    });
    
    if(isGroupExpense){
      const groupDoc = await group.findById(groupId);
      if(!groupDoc) return res.status(404).json({message : "Group not found"});
      groupDoc.totalExpense += parseFloat(amount);
      groupDoc.expenses = groupDoc.expenses || [];
      groupDoc.expenses.push(expense._id);
      await groupDoc.save();
    }
      if(!expense) return res.status(400).json({message : "Error in creating expense"});
    
    // Populate expense details before sending the response
    const populatedExpense = await Expense.findById(expense._id)
      .populate('senderId', 'name email')
      .populate('participants.user', 'name email')
      .populate('groupId');
      
    return res.status(201).json({
      message: "Expense created successfully", 
      expense: populatedExpense
    });
  } catch (error) {
    console.error("Add expense error:", error);
    return res.status(500).json({message: "Internal server error", error: error.message});
  }
}



const getExpenseSummary = async (req, res) => {
  try {
    let { amount, participants, senderId } = req.body;
    console.log("Expense Summary Request Body:", req.body);
    // Validate input
    if (!amount || !Array.isArray(participants) || participants.length === 0 || !senderId) {
      return res.status(400).json({ message: "Invalid request body" });
    }

    // Ensure amount is a number
    amount = parseFloat(amount);

    // Parse participants if needed and normalize structure
    if (typeof participants === 'string') {
      try {
        participants = JSON.parse(participants);
      } catch (error) {
        return res.status(400).json({ message: "Invalid participants format" });
      }
    }

    // Normalize participants data
    participants = participants.map(person => ({
      user: person.user || person.userId,
      share: parseFloat(person.share || 0),
      isSettled: person.isSettled || false,
      transactionId: person.transactionId || null
    }));

    // // Validate total shares equal amount
     const totalShares = participants.reduce((sum, person) => sum + person.share, 0);
    const participantSummary = await Promise.all(
      participants.map(async (person) => {
        const user = await User.findById(person.user).select('name email');
        return {
          userId: person.user,
          userName: user ? user.name : 'Unknown User',
          userEmail: user ? user.email : null,
          share: person.share,
          isSettled: person.isSettled,
          transactionId: person.transactionId
        };
      })
    );    // Get sender information
    const sender = await User.findById(senderId).select('name email');

    // Total amount the sender should receive
    const totalAmountOwedToSender = totalShares;

    return res.status(200).json({
      totalAmount: amount,
      senderId: senderId,
      senderName: sender ? sender.name : 'Unknown Sender',
      senderEmail: sender ? sender.email : null,
      totalAmountOwedToSender: totalAmountOwedToSender,
      participants: participantSummary
    });

  } catch (error) {
    console.error("Expense summary error:", error);
    return res.status(500).json({ message: "Server Error", error: error.message });
  }
};


const deleteExpense = async (req,res) => {
  try {
    const {id} = req.user;
    const {expenseId} = req.params;
    console.log
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

export { getUserExpenses, addExpense, getExpenseSummary, deleteExpense, getExpenseById };
