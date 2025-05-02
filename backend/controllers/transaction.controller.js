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
    .sort({ date: -1 }); // Sort by date, newest first
    
    if(!transactions || transactions.length === 0) {
      return res.status(404).json({message: "No transactions found"});
    }
    
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
      transactions,
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
  const {amount,description,category,senderId,receiverId} = req.body;
  try {
    if(!amount || !description || !category || !senderId || !receiverId) {
      return res.status(400).json({message : "Please fill all the fields"});
    }
    const transaction = await Transactions.create({amount,description,category,senderId,receiverId});
    return res.status(201).json({message : "Transaction done Successfully",transaction});
  } catch (error) {
    console.error("Error adding transaction:", error);
    return res.status(500).json({message: "Internal server error", error: error.message});
  }
}

const updateTransaction = async (req,res) => {
  const {id} = req.params;
  const {amount,description,category,senderId,receiverId} = req.body;
  try {
    if(!amount || !description || !category || !senderId || !receiverId) {
      return res.status(400).json({message : "Please fill all the fields"});
    }
    const transaction = await Transactions.findByIdAndUpdate(id,{amount,description,category,senderId,receiverId},{new : true});
    if(!transaction) {
      return res.status(404).json({message : "Transaction not found"});
    }
    transaction.save();
    return res.status(200).json({message : "Transaction updated Successfully",transaction});
  } catch (error) {
    console.log(error);
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

const filterTransactions = async (req, res) => {
  try {
    const { tab, timeFilter, customDate } = req.query;
    const { id } = req.user;
    
    console.log("Filter transactions request:", { tab, timeFilter, customDate, userId: id });
    
    // Base query - user is either sender or receiver
    let query = {
      $or: [
        { senderId: id },
        { receiverId: id }
      ]
    };
    
    // Apply tab filter (transaction type)
    if (tab === "owe") {
      console.log("Filtering for transactions you owe (as receiver)");
      query = {
        receiverId: id, 
        isSettled: false
      };
    } else if (tab === "owed") {
      console.log("Filtering for transactions owed to you (as sender)");
      query = {
        senderId: id,
        isSettled: false
      };
    }
    
    // Apply time filter
    if (timeFilter) {
      const now = new Date();
      
      switch (timeFilter) {
        case 'today':
          const startOfDay = new Date(now);
          startOfDay.setHours(0, 0, 0, 0);
          query.date = { $gte: startOfDay, $lte: now };
          break;
          
        case 'week':
          const startOfWeek = new Date(now);
          startOfWeek.setDate(now.getDate() - now.getDay()); // Start of current week (Sunday)
          startOfWeek.setHours(0, 0, 0, 0);
          query.date = { $gte: startOfWeek, $lte: now };
          break;
          
        case 'month':
          const startOfMonth = new Date(now);
          startOfMonth.setDate(1); // Start of current month
          startOfMonth.setHours(0, 0, 0, 0);
          query.date = { $gte: startOfMonth, $lte: now };
          break;
          
        case 'year':
          const startOfYear = new Date(now);
          startOfYear.setMonth(0, 1); // January 1st of current year
          startOfYear.setHours(0, 0, 0, 0);
          query.date = { $gte: startOfYear, $lte: now };
          break;
          
        case 'custom':
          if (customDate) {
            const selectedDate = new Date(customDate);
            const nextDay = new Date(selectedDate);
            nextDay.setDate(nextDay.getDate() + 1);
            query.date = { $gte: selectedDate, $lt: nextDay };
          }
          break;
      }
    }
    
    console.log("Final MongoDB query:", JSON.stringify(query));
    
    // Execute query with population and sorting
    const transactions = await Transactions.find(query)
      .populate('senderId', 'name email')
      .populate('receiverId', 'name email')
      .sort({ date: -1 });
    
    console.log(`Found ${transactions.length} transactions matching query`);
    
    // Process results into the expected format - Fixed ID comparison with toString()
    const youOwe = transactions.filter(txn => 
      txn.receiverId._id.toString() === id.toString() && !txn.isSettled
    );
    
    const owedToYou = transactions.filter(txn => 
      txn.senderId._id.toString() === id.toString() && !txn.isSettled
    );
    
    const youOweTotal = youOwe.reduce((sum, txn) => sum + txn.amount, 0);
    const owedToYouTotal = owedToYou.reduce((sum, txn) => sum + txn.amount, 0);
    
    console.log("Filter results:", {
      youOweCount: youOwe.length,
      owedToYouCount: owedToYou.length,
      youOweTotal,
      owedToYouTotal
    });
    
    if (tab === "owed" && owedToYou.length > 0) {
      console.log("Detailed 'owed to you' transactions:");
      owedToYou.forEach(txn => {
        console.log(`ID: ${txn._id}, Amount: ${txn.amount}, Date: ${txn.date}, Receiver: ${txn.receiverId.name}`);
      });
    }
    
    return res.status(200).json({
      message: "Transactions fetched successfully",
      count: transactions.length,
      transactions,
      youOwe,
      owedToYou,
      youOweTotal,
      owedToYouTotal
    });
    
  } catch (error) {
    console.error("Filter transactions error:", error);
    return res.status(500).json({ 
      message: "Internal server error", 
      error: error.message 
    });
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

export {getUserTransactions, addTransaction, updateTransaction, getTransactionSummary, filterTransactions, settleTransaction, requestPayment};