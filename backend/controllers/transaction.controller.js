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
    
    // Separate transactions into "you owe" and "owed to you"
    const youOwe = transactions.filter(txn => txn.senderId._id.toString() === id && !txn.isSettled);
    const owedToYou = transactions.filter(txn => txn.receiverId._id.toString() === id && !txn.isSettled);
    
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

const getTransactionSummary = async (req,res) => {
  try {
    const {id} = req.user;

    // Find transactions where the user is either sender or receiver
    const transactions = await Transactions.find({
      $or: [
        { senderId: id },
        { receiverId: id }
      ]
    }).populate("senderId", "name").populate("receiverId", "name");
    
    if (!transactions || transactions.length === 0) {
      return res.status(404).json({ message: "No transactions found" });
    }

    let totalYouOwe = 0;
    let totalYouAreOwed = 0;
    const friendBalances = {};

    transactions.forEach(txn => {
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
      if(isSender) {
        totalYouOwe += amount;
        friendBalances[otherUserId].balance -= amount;
      } else {
        totalYouAreOwed += amount;
        friendBalances[otherUserId].balance += amount;
      }
    });
    
    const netBalance = totalYouAreOwed - totalYouOwe;

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
    
    // Base query - user is either sender or receiver
    let query = {
      $or: [
        { senderId: id },
        { receiverId: id }
      ]
    };
    
    // Apply tab filter (transaction type)
    if (tab === "you-owe") {
      query = {
        senderId: id,
        isSettled: false
      };
    } else if (tab === "owed-to-you") {
      query = {
        receiverId: id,
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
    
    // Execute query with population and sorting
    const transactions = await Transactions.find(query)
      .populate('senderId', 'name email')
      .populate('receiverId', 'name email')
      .sort({ date: -1 });
    
    // Process results into the expected format
    const youOwe = transactions.filter(txn => 
      txn.senderId._id.toString() === id && !txn.isSettled
    );
    
    const owedToYou = transactions.filter(txn => 
      txn.receiverId._id.toString() === id && !txn.isSettled
    );
    
    return res.status(200).json({
      message: "Transactions fetched successfully",
      count: transactions.length,
      transactions,
      youOwe,
      owedToYou,
      youOweTotal: youOwe.reduce((sum, txn) => sum + txn.amount, 0),
      owedToYouTotal: owedToYou.reduce((sum, txn) => sum + txn.amount, 0)
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
      return res.status(404).json({ message: "Expense not found" });
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
      return res.status(400).json({ message: "Failed to mark as settled" });
    }

    return res.status(200).json({ message: "Transaction settled successfully" });

  } catch (error) {
    console.error("Error settling transaction:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
export {getUserTransactions,addTransaction,updateTransaction,getTransactionSummary,filterTransactions,settleTransaction};