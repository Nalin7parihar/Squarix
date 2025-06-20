import Transactions from "../model/transaction.model.js";
import Expense from "../model/expense.model.js";

const getUserTransactions = async (req,res) => {
  try {
    const { id } = req.user;
    
    // Find transactions where the user is either sender or receiver
    const transactions = await Transactions.find({
      $or: [
        { senderId: id },
        { receiverId: id }
      ]
    })
    .populate("senderId", "name email")
    .populate("receiverId", "name email")
    .populate("expenseId", "title")
    .sort({ date: -1 }); // Sort by date, newest first
      if(!transactions || transactions.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No transactions found",
        transactions: [],
        summary: {
          youOwe: [],
          owedToYou: [],
          totalOwed: 0,
          totalOwing: 0
        }
      });
    }
    
    // Add transaction type and other user info for frontend
    const transactionsWithContext = transactions.map(txn => {
      const isUserSender = txn.senderId._id.toString() === id.toString();
      return {
        ...txn.toObject(),
        type: isUserSender ? "owed" : "owe", // owed = you are owed money, owe = you owe money
        otherUser: isUserSender ? txn.receiverId.name : txn.senderId.name,
        otherUserEmail: isUserSender ? txn.receiverId.email : txn.senderId.email
      };
    });
    
    // Fixed: Correctly identify "you owe" and "owed to you" transactions
    // You owe = User is receiver and not settled
    const youOwe = transactions.filter(txn => 
      txn.receiverId._id.toString() === id.toString() && !txn.isSettled
    );
    // Owed to you = User is sender and not settled
    const owedToYou = transactions.filter(txn => 
      txn.senderId._id.toString() === id.toString() && !txn.isSettled
    );
    
    return res.status(200).json({
      message: "Transactions found",
      transactions: transactionsWithContext,
      summary: {
        youOwe,
        owedToYou,
        youOweTotal: youOwe.reduce((sum, txn) => sum + txn.amount, 0),
        owedToYouTotal: owedToYou.reduce((sum, txn) => sum + txn.amount, 0)
      }
    });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return res.status(500).json({message: "Internal server error", error: error.message});
  }
}

const addTransaction = async (req,res) => {
  const {amount, description, category, receiverId, expenseId} = req.body;
  const senderId = req.user.id; // Get senderId from authenticated user
  
  try {
    if(!amount || !description || !category || !receiverId) {
      return res.status(400).json({message : "Please fill all the required fields"});
    }
    
    const transactionData = {
      amount,
      description,
      category,
      senderId,
      receiverId
    };
    
    // Add expenseId if provided
    if(expenseId) {
      transactionData.expenseId = expenseId;
    }
    
    const transaction = await Transactions.create(transactionData);
    
    // If this transaction is related to an expense, update the participant's transactionId
    if(expenseId) {
      try {
        // Find the expense and update the participant's transactionId
        await Expense.updateOne(
          {
            _id: expenseId,
            "participants.user": senderId
          },
          {
            $set: {
              "participants.$.transactionId": transaction._id
            }
          }
        );
        console.log(`Updated expense ${expenseId} with transaction ${transaction._id} for user ${senderId}`);
      } catch (updateError) {
        console.error("Error updating expense participant:", updateError);
        // Don't fail the transaction creation if expense update fails
      }
    }
    
    return res.status(201).json({message : "Transaction done Successfully", transaction});
  } catch (error) {
    console.error("Error adding transaction:", error);
    return res.status(500).json({message: "Internal server error", error: error.message});
  }
}

const updateTransaction = async (req,res) => {
  const {id} = req.params;
  const {description} = req.body;
  try {
    if(!description) {
      return res.status(400).json({message : "Description is required"});
    }
    
    const transaction = await Transactions.findByIdAndUpdate(id, {description}, {new : true});
    if(!transaction) {
      return res.status(404).json({message : "Transaction not found"});
    }
    transaction.save();
    return res.status(200).json({message : "Transaction updated Successfully",transaction});
  } catch (error) {
    console.log(error);
    return res.status(500).json({message: "Internal server error", error: error.message});
  }
}

// In getTransactionSummary function
const getTransactionSummary = async (req,res) => {
  try {
    const {id} = req.user;
    console.log("Getting summary for user ID:", id);

    // Find transactions where the user is either sender or receiver
    const transactions = await Transactions.find({
      $or: [
        { senderId: id },
        { receiverId: id }
      ]
    }).populate("senderId", "name").populate("receiverId", "name");
      if (!transactions || transactions.length === 0) {
      console.log("No transactions found for user");
      return res.status(200).json({ 
        success: true,
        message: "No transactions found",
        summary: {
          totalYouOwe: 0,
          totalYouAreOwed: 0,
          netBalance: 0,
          friendBalances: {}
        }
      });
    }

    console.log(`Found ${transactions.length} total transactions`);

    let totalYouOwe = 0;
    let totalYouAreOwed = 0;
    const friendBalances = {};
    
    // Only consider unsettled transactions for balances
    const unsettledTransactions = transactions.filter(txn => !txn.isSettled);
    console.log(`Found ${unsettledTransactions.length} unsettled transactions`);

    unsettledTransactions.forEach(txn => {
      const isSender = txn.senderId._id.toString() === id.toString();
      const otherUser = isSender ? txn.receiverId : txn.senderId;
      const otherUserId = otherUser._id.toString();

      if(!friendBalances[otherUserId]) {
        friendBalances[otherUserId] = {
          name: otherUser.name,
          balance: 0
        }
      }
      
      const amount = txn.amount;
      
      // Debug this transaction
      console.log(`Transaction: ${txn._id}, Amount: ${amount}, isSender: ${isSender}, isSettled: ${txn.isSettled}`);
      
      // FIXED: Align with other methods - sender is owed money, receiver owes money
      if(isSender) {
        totalYouAreOwed += amount;
        friendBalances[otherUserId].balance += amount;
        console.log(`Added ${amount} to totalYouAreOwed, new total: ${totalYouAreOwed}`);
      } else {
        totalYouOwe += amount;
        friendBalances[otherUserId].balance -= amount;
        console.log(`Added ${amount} to totalYouOwe, new total: ${totalYouOwe}`);
      }
    });
    
    const netBalance = totalYouAreOwed - totalYouOwe;
    
    console.log("Final calculations:", {
      totalYouAreOwed,
      totalYouOwe,
      netBalance,
      friendBalancesCount: Object.keys(friendBalances).length
    });

    return res.status(200).json({
      totalYouAreOwed,
      totalYouOwe,
      netBalance,
      friendBalances: Object.values(friendBalances)
    });
  } catch (error) {
    console.error("Error getting transaction summary:", error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
}



const settleTransaction = async (req, res) => {
  const { id } = req.params;

  try {
    // Step 1: Find the transaction
    const transaction = await Transactions.findById(id);
    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    // Step 2: Mark transaction as settled
    transaction.isSettled = true;
    await transaction.save();

    // Step 3: Find the related expense
    const expense = await Expense.findOne({
      "participants.transactionId": id,
    });

    if (!expense) {
      return res.status(200).json({ 
        message: "Transaction settled successfully",
        transaction 
      });
    }    // Step 4: Update the participant's isSettled flag 
    // Note: We don't set share to 0 anymore to preserve original share amount
    const updated = await Expense.updateOne(
      {
        _id: expense._id,
        "participants.transactionId": id,
      },
      {
        $set: {
          "participants.$.isSettled": true,
        },
      }
    );

    if (updated.modifiedCount === 0) {
      return res.status(400).json({ message: "Failed to mark expense as settled" });
    }

    return res.status(200).json({ 
      message: "Transaction settled successfully",
      transaction,
      expenseUpdated: true
    });

  } catch (error) {
    console.error("Error settling transaction:", error);
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

// Fix requestPayment function to use consistent parameter naming
const requestPayment = async (req, res) => {
  const { id: transactionId } = req.params;
  const { id } = req.user;  // Changed from userId to id for consistency

  try {
    console.log(`Request payment for transaction ${transactionId} by user ${id}`);
    
    // Find the transaction
    const transaction = await Transactions.findById(transactionId);
    if (!transaction) {
      console.log("Transaction not found");
      return res.status(404).json({ message: "Transaction not found" });
    }

    // Verify that the current user is the sender (the one who is owed money)
    if (transaction.senderId.toString() !== id.toString()) {
      console.log(`User ${id} is not the sender (${transaction.senderId})`);
      return res.status(403).json({ 
        message: "You can only request payments for transactions where you are the sender" 
      });
    }

    // In a real app, you would send an email/notification to the receiver
    // For now, we'll just return success
    console.log("Payment request successful");

    return res.status(200).json({
      message: "Payment request sent successfully",
      transactionId: transactionId
    });
  } catch (error) {
    console.error("Error requesting payment:", error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// Get expense details with remaining balance for a specific participant
const getExpenseBalance = async (req, res) => {
  try {
    const { expenseId, participantId } = req.params;
    const userId = req.user.id;

    // Find the expense
    const expense = await Expense.findById(expenseId)
      .populate('senderId', 'name email')
      .populate('participants.user', 'name email');

    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    // Verify user is involved in this expense
    const isUserSender = expense.senderId._id.toString() === userId;
    const isUserParticipant = expense.participants.some(p => p.user._id.toString() === userId);

    if (!isUserSender && !isUserParticipant) {
      return res.status(403).json({ message: "Not authorized to view this expense" });
    }

    // Find the specific participant
    const participant = expense.participants.find(p => p.user._id.toString() === participantId);
    
    if (!participant) {
      return res.status(404).json({ message: "Participant not found in this expense" });
    }

    // Calculate total paid by this participant for this expense
    const paidTransactions = await Transactions.find({
      expenseId: expenseId,
      senderId: participantId,
      receiverId: expense.senderId._id,
      isSettled: true
    });

    const totalPaid = paidTransactions.reduce((sum, txn) => sum + txn.amount, 0);
    const originalShare = participant.share;
    const remainingBalance = Math.max(0, originalShare - totalPaid);

    return res.status(200).json({
      success: true,
      expense: {
        _id: expense._id,
        title: expense.title,
        amount: expense.amount,
        category: expense.category,
        date: expense.date || expense.createdAt,
        sender: expense.senderId
      },
      participant: {
        user: participant.user,
        originalShare: originalShare,
        totalPaid: totalPaid,
        remainingBalance: remainingBalance,
        isFullySettled: remainingBalance === 0
      },
      paymentHistory: paidTransactions
    });

  } catch (error) {
    console.error("Error getting expense balance:", error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// Create transaction for expense payment (handles partial payments)
const addExpensePayment = async (req, res) => {
  try {
    const { expenseId, amount, description } = req.body;
    const payerId = req.user.id; // Person making the payment

    if (!expenseId || !amount || amount <= 0) {
      return res.status(400).json({ message: "Expense ID and valid amount are required" });
    }

    // Find the expense
    const expense = await Expense.findById(expenseId)
      .populate('senderId', 'name email')
      .populate('participants.user', 'name email');

    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    // Find the participant (payer) in the expense
    const participant = expense.participants.find(p => p.user._id.toString() === payerId);
    
    if (!participant) {
      return res.status(400).json({ message: "You are not a participant in this expense" });
    }

    // Calculate how much has already been paid
    const existingTransactions = await Transactions.find({
      expenseId: expenseId,
      senderId: payerId,
      receiverId: expense.senderId._id
    });

    const totalPaid = existingTransactions.reduce((sum, txn) => sum + txn.amount, 0);
    const originalShare = participant.share;
    const remainingBalance = originalShare - totalPaid;

    if (remainingBalance <= 0) {
      return res.status(400).json({ 
        message: "You have already paid your full share for this expense",
        details: {
          originalShare,
          totalPaid,
          remainingBalance: 0
        }
      });
    }

    if (amount > remainingBalance) {
      return res.status(400).json({ 
        message: `Payment amount (${amount}) exceeds remaining balance (${remainingBalance})`,
        details: {
          originalShare,
          totalPaid,
          remainingBalance
        }
      });
    }

    // Create the transaction
    const transaction = await Transactions.create({
      amount: parseFloat(amount),
      description: description || `Payment for ${expense.title}`,
      category: expense.category,
      senderId: payerId,
      receiverId: expense.senderId._id,
      expenseId: expenseId,
      groupId: expense.groupId || null,
      isSettled: true // Mark as settled since it's a payment
    });

    // Calculate new remaining balance
    const newRemainingBalance = remainingBalance - amount;
    const isFullyPaid = newRemainingBalance === 0;

    // If fully paid, update the participant's settlement status
    if (isFullyPaid) {
      await Expense.updateOne(
        { _id: expenseId, "participants.user": payerId },
        { 
          $set: { 
            "participants.$.isSettled": true,
            "participants.$.transactionId": transaction._id
          } 
        }
      );
    }

    const populatedTransaction = await Transactions.findById(transaction._id)
      .populate('senderId', 'name email')
      .populate('receiverId', 'name email')
      .populate('expenseId', 'title amount');

    return res.status(201).json({
      success: true,
      message: isFullyPaid 
        ? "Payment completed! Your share is fully settled." 
        : `Partial payment received. Remaining balance: $${newRemainingBalance.toFixed(2)}`,
      transaction: populatedTransaction,
      paymentStatus: {
        originalShare,
        totalPaid: totalPaid + amount,
        remainingBalance: newRemainingBalance,
        isFullySettled: isFullyPaid
      }
    });

  } catch (error) {
    console.error("Error adding expense payment:", error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// Request remaining payment for an expense
const requestRemainingPayment = async (req, res) => {
  try {
    const { expenseId, participantId } = req.body;
    const requesterId = req.user.id;

    // Find the expense
    const expense = await Expense.findById(expenseId)
      .populate('senderId', 'name email')
      .populate('participants.user', 'name email');

    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    // Verify requester is the expense sender
    if (expense.senderId._id.toString() !== requesterId) {
      return res.status(403).json({ message: "Only the expense creator can request payments" });
    }

    // Find the participant
    const participant = expense.participants.find(p => p.user._id.toString() === participantId);
    
    if (!participant) {
      return res.status(404).json({ message: "Participant not found in this expense" });
    }

    // Calculate remaining balance
    const existingTransactions = await Transactions.find({
      expenseId: expenseId,
      senderId: participantId,
      receiverId: requesterId
    });

    const totalPaid = existingTransactions.reduce((sum, txn) => sum + txn.amount, 0);
    const remainingBalance = participant.share - totalPaid;

    if (remainingBalance <= 0) {
      return res.status(400).json({ 
        message: "This participant has already paid their full share",
        details: {
          originalShare: participant.share,
          totalPaid,
          remainingBalance: 0
        }
      });
    }

    // In a real app, you would send a notification/email here
    // For now, we'll just return a success message

    return res.status(200).json({
      success: true,
      message: `Payment request sent to ${participant.user.name} for remaining balance of $${remainingBalance.toFixed(2)}`,
      requestDetails: {
        expense: {
          title: expense.title,
          amount: expense.amount
        },
        participant: participant.user,
        originalShare: participant.share,
        totalPaid,
        remainingBalance
      }
    });

  } catch (error) {
    console.error("Error requesting remaining payment:", error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

export {getUserTransactions, addTransaction, updateTransaction, getTransactionSummary, settleTransaction, requestPayment, getExpenseBalance, addExpensePayment, requestRemainingPayment};