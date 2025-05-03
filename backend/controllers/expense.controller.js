import Expense from "../model/expense.model.js";
import { v2 as cloudinary } from "cloudinary";
import group from "../model/group.model.js";
import Transactions from "../model/transaction.model.js";

const getUserExpenses = async (req,res) => {
  try {
    const {id} = req.user;
    // Query for expenses where user is either sender or participant
    const expenses = await Expense.find({
      $or: [
        { senderId: id },
        { 'participants.user': id }
      ]
    })
    .populate('senderId', 'name email') // Populate sender information
    .populate('participants.user', 'name email') // Populate participant information
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
    console.log("Total Shares:", totalShares, "Amount:", amount);
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
    
    // Create transactions for each participant
    const updatedParticipants = [];
    const transactions = [];
    
    try {
      for (const participant of participants) {
        // Skip participants with zero share or the sender (sender doesn't owe themselves)
        if (participant.share <= 0 || participant.user.toString() === actualSenderId.toString()) {
          updatedParticipants.push(participant);
          continue;
        }
        

        const transaction = await Transactions.create({
          amount: participant.share,
          date: expense.createdAt || new Date(),
          description: `Share of expense: ${title}`,
          category: category,
          senderId: actualSenderId,    // Person who paid and should receive money
          receiverId: participant.user, // Person who owes money
          isSettled: false,
          expenseId: expense._id       // Link to the original expense
        });
        
        transactions.push(transaction);
        
        // Update the participant with the transaction ID
        updatedParticipants.push({
          ...participant,
          transactionId: transaction._id,
          isSettled: false
        });
      }
      
      // Update the expense with transaction IDs
      if (updatedParticipants.length > 0) {
        await Expense.findByIdAndUpdate(expense._id, {
          participants: updatedParticipants
        });
      }
      
      // Populate expense details before sending the response
      const populatedExpense = await Expense.findById(expense._id)
        .populate('senderId', 'name email')
        .populate('participants.user', 'name email')
        .populate('groupId');
        
      return res.status(201).json({
        message: "Expense created successfully", 
        expense: populatedExpense,
        transactions: transactions.length > 0 ? transactions : []
      });
      
    } catch (transactionError) {
      // If transaction creation fails, log error but don't fail the whole expense creation
      console.error("Error creating transactions for expense:", transactionError);
      
      // Still return the expense, but with a warning
      const populatedExpense = await Expense.findById(expense._id)
        .populate('senderId', 'name email')
        .populate('participants.user', 'name email')
        .populate('groupId');
        
      return res.status(201).json({
        message: "Expense created but there was an issue creating some transactions", 
        expense: populatedExpense,
        transactionError: transactionError.message
      });
    }
  } catch (error) {
    console.error("Add expense error:", error);
    return res.status(500).json({message: "Internal server error", error: error.message});
  }
}

const updateExpense = async (req,res) => {
  try {
    const {id} = req.user;
    const {title, amount, groupId, category} = req.body;
    let {participants} = req.body;
    const {expenseId} = req.params;
    
    if(!title || !amount || !participants) {
      return res.status(400).json({message : "Please provide all the fields"});
    }
    
    // Make sure participants is parsed if it's a string
    if(typeof participants === 'string') {
      participants = JSON.parse(participants);
    }
    
    // Validate participants structure
    if(!Array.isArray(participants)) {
      return res.status(400).json({message: "Participants must be an array"});
    }
    
    // Check if expense exists and user is authorized
    const expense = await Expense.findById(expenseId);
    if(!expense) {
      return res.status(404).json({message : "Expense not found"});
    }
    if(expense.senderId.toString() !== id) {
      return res.status(403).json({message : "You are not authorized to update this expense"});
    }
    
    // Normalize participant data
    const updatedParticipants = participants.map(participant => {
      return {
        user: participant.user || participant.userId, // Support both naming conventions
        share: parseFloat(participant.share),
        isSettled: participant.isSettled || false,
        transactionId: participant.transactionId || null,
      };
    });
    
    // Validate total shares equal amount
    const totalShares = updatedParticipants.reduce((sum, participant) => sum + participant.share, 0);
    if(Math.abs(totalShares - parseFloat(amount)) > 0.01) { // Allow small floating point differences
      return res.status(400).json({
        message: "Sum of shares must equal total amount"
      });
    }

    // Handle transactions for participants
    try {
      // Map to track which participants already have transactions
      const existingTransactionMap = new Map();
      
      // First, identify participants that already have transactions
      expense.participants.forEach(participant => {
        if (participant.transactionId) {
          existingTransactionMap.set(participant.user.toString(), participant.transactionId);
        }
      });
      
      // Process each participant
      for (const participant of updatedParticipants) {
        const participantId = participant.user.toString();
        
        // Skip the expense creator/payer
        if (participantId === expense.senderId.toString()) {
          continue;
        }
        
        // If participant has an existing transaction
        if (existingTransactionMap.has(participantId) && participant.transactionId) {
          // Update the existing transaction
          const transactionId = existingTransactionMap.get(participantId);
          await Transactions.findByIdAndUpdate(transactionId, {
            amount: participant.share,
            description: `Share of expense: ${title}`,
            category: category,
            isSettled: participant.isSettled || false
          });
        } 
        // Create a new transaction if needed
        else if (participant.share > 0) {
          const transaction = await Transactions.create({
            amount: participant.share,
            date: expense.createdAt || new Date(),
            description: `Share of expense: ${title}`,
            category: category,
            senderId: expense.senderId,     // Person who paid and should receive money
            receiverId: participantId,      // Person who owes money
            isSettled: participant.isSettled || false,
            expenseId: expenseId
          });
          
          // Update the participant with new transaction ID
          participant.transactionId = transaction._id;
        }
      }
    } catch (transactionError) {
      console.error("Error updating transactions for expense:", transactionError);
      // Continue with expense update even if transaction update fails
    }
    
    // Update the expense with the normalized data
    const updatedExpense = await Expense.findByIdAndUpdate(
      expenseId,
      {
        title,
        amount: parseFloat(amount),
        participants: updatedParticipants,
        groupId,
        category
      },
      {new : true}
    )
    .populate('senderId', 'name email')
    .populate('participants.user', 'name email')
    .populate('groupId');

    if(!updatedExpense) {
      return res.status(400).json({message : "Error in updating expense"});
    }
    
    return res.status(200).json({
      message : "Expense updated successfully",
      expense: updatedExpense
    });
  } catch (error) {
    console.error("Update expense error:", error);
    return res.status(500).json({message : "Internal server error", error: error.message});
  }
}

const getExpenseSummary = async (req, res) => {
  try {
    let { amount, participants, senderId } = req.body;

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

    // Validate total shares equal amount
    const totalShares = participants.reduce((sum, person) => sum + person.share, 0);
    if (Math.abs(totalShares - amount) > 0.01) {
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
    const totalAmountOwedToSender = totalShares;

    return res.status(200).json({
      totalAmount: amount,
      senderId: senderId,
      totalAmountOwedToSender: totalAmountOwedToSender,
      participants: participantSummary
    });

  } catch (error) {
    console.error("Expense summary error:", error);
    return res.status(500).json({ message: "Server Error", error: error.message });
  }
};

const filterExpenses = async (req,res) => {
  try {
    const { timePeriod, date, type } = req.query;
    const { id } = req.user;
    
    // Base query: expenses where user is either sender or participant
    let query = { $or: [{ senderId: id }, { 'participants.user': id }] };
    let dateFilter = {};

    // Handle time period filter
    if (timePeriod) {
      const now = new Date();
      let filterDate;
      
      switch (timePeriod) {
        case '30days':
          filterDate = new Date(now);
          filterDate.setDate(now.getDate() - 30);
          dateFilter = { createdAt: { $gte: filterDate } };
          break;
        case '6months':
          filterDate = new Date(now);
          filterDate.setMonth(now.getMonth() - 6);
          dateFilter = { createdAt: { $gte: filterDate } };
          break;
        case 'year':
          filterDate = new Date(now);
          filterDate.setFullYear(now.getFullYear() - 1);
          dateFilter = { createdAt: { $gte: filterDate } };
          break;
        default:
          // No filter for invalid time period
          break;
      }
    }

    // Handle specific date filter (overrides time period if both provided)
    if (date) {
      try {
        const selectedDate = new Date(date);
        if (!isNaN(selectedDate.getTime())) { // Check if valid date
          const nextDay = new Date(selectedDate);
          nextDay.setDate(selectedDate.getDate() + 1);
          
          dateFilter = {
            createdAt: {
              $gte: selectedDate,
              $lt: nextDay
            }
          };
        }
      } catch (err) {
        console.error("Invalid date format:", err);
      }
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
            'participants.user': id,
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
              { 'participants.user': id }
            ],
            'participants.isSettled': true
          };
          break;
        default:
          // Keep the base query for invalid type
          break;
      }
    }

    // Apply the query
    const expenses = await Expense.find(query)
      .sort({ createdAt: -1 })
      .populate('senderId', 'name email')
      .populate('participants.user', 'name email')
      .populate('groupId');

    // Return empty array instead of 404 error for consistency with getUserExpenses
    return res.status(200).json({
      message: expenses.length > 0 ? "Expenses fetched successfully" : "No expenses found matching the filters",
      count: expenses.length,
      expenses: expenses || []
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
