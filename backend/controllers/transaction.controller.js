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
      return res.status(404).json({message: "No transactions found"});
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
      return res.status(404).json({ message: "No transactions found" });
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
    }

    // Step 4: Update the participant's isSettled flag
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

export {getUserTransactions, addTransaction, updateTransaction, getTransactionSummary, settleTransaction, requestPayment};