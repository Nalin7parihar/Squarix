import Transactions from "../model/transaction.model.js";
import Expense from "../model/expense.model.js";

const getUserTransactions = async (req,res) => {
  try {
    const transactions = await Transactions.find({senderId : req.user.id}).populate("senderId").populate("receiverId");
    if(!transactions) {
      return res.status(404).json({message : "Transactions not found"});
    }
    return res.status(200).json({message : "Transactiond found",transactions});

  } catch (error) {
    console.log(error);
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
    console.log(error);
    
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
  const {id} = req.user;

  const transactions = await Transactions.find({$or  : [{senderId:  id,receiverId : id}]}).populate("senderId receiverId","name");
  let totalYouOwe = 0;
  let totalYouAreOwed = 0;
  const friendBalances = {};

  transactions.forEach(txn => {
    const isSender = txn.senderId._id.equals(id);
    const otherUser = isSender ? txn.receiverId : txn.senderId;

    if(!friendBalances[otherUser._id]) {
      friendBalances[otherUser._id] = {
        name : otherUser.name,
        balance : 0
      }
    }
    const amount = txn.amount;
    if(isSender) {
      totalYouOwe += amount;
      friendBalances[otherUser._id].balance -= amount;
    } else {
      totalYouAreOwed += amount;
      friendBalances[otherUser._id].balance += amount;
    }
  })
    const netBalance = totalYouAreOwed - totalYouOwe;

    res.json({totalYouAreOwed,totalYouOwe,netBalance,friendBalances});
}
const filterTransactions = async (req,res) => {
  const {tab,date} = req.query;
  const {id} = req.user;
  try {
     if(tab === "youOwe") {
      const transactions = await Transactions.find({senderId : id}).populate("senderId ","name");
      if(!transactions) {
        return res.status(404).json({message : "Transactions not found"});
      }
      if(transactions.length === 0) {
        return res.status(200).json({message : "No transactions found"});
      }
      let filteredTransactions  = transactions.filter(txn => {
        return txn.senderId._id.equals(id);
      });
      return res.status(200).json({message :  "Transactions found",transactions : filteredTransactions});

    } else if(tab === "youAreOwed") {
      const transactions = await Transactions.find({receiverId : id}).populate("receiverId ","name");
      if(!transactions) {
        return res.status(404).json({message : "Transactions not found"});
      }
      if(transactions.length === 0) {
        return res.status(200).json({message : "No transactions found"});
      }
      let filteredTransactions  = transactions.filter(txn => {
        return txn.receiverId._id.equals(id);
      });
      return res.status(200).json({message :  "Transactions found",transactions : filteredTransactions});

    }

    if(date == "This today") {
      const startOfDay = new Date();
      startOfDay.setHours(0,0,0,0);
      const endOfDay = new Date();
      endOfDay.setHours(23,59,59,999);
      const transactions = await Transactions.find({date : {$gte : startOfDay,$lte :endOfDay}}).populate("senderId ","name");
      if(!transactions) {
        return res.status(404).json({message : "Transactions not found"});
      }
      return res.status(200).json({message : "Transactions found",transactions});
    }
    else if(date === "This week") {
      const startOfWeek = new Date();
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
      startOfWeek.setHours(0,0,0,0);
      const endOfWeek = new Date();
      endOfWeek.setDate(endOfWeek.getDate() + (6 - endOfWeek.getDay()));
      endOfWeek.setHours(23,59,59,999);
      const transactions = await Transactions.find({date : {$gte : startOfWeek,$lte :endOfWeek}}).populate("senderId ","name");
      if(!transactions) {
        return res.status(404).json({message : "Transactions not found"});
      }
      return res.status(200).json({message : "Transactions found",transactions});
    }
    else if(date === "This month") {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0,0,0,0);
      const endOfMonth = new Date();
      endOfMonth.setMonth(endOfMonth.getMonth() + 1);
      endOfMonth.setDate(0);
      endOfMonth.setHours(23,59,59,999);
      const transactions = await Transactions.find({date : {$gte : startOfMonth,$lte :endOfMonth}}).populate("senderId ","name");
      if(!transactions) {
        return res.status(404).json({message : "Transactions not found"});
      }
      return res.status(200).json({message : "Transactions found",transactions});
    }
    else if(date === "This year") {
      const startOfYear = new Date();
      startOfYear.setDate(1);
      startOfYear.setMonth(0);
      startOfYear.setHours(0,0,0,0);
      const endOfYear = new Date();
      endOfYear.setDate(31);
      endOfYear.setMonth(11);
      endOfYear.setHours(23,59,59,999);
      const transactions = await Transactions.find({date : {$gte : startOfYear,$lte :endOfYear}}).populate("senderId ","name");
      if(!transactions) {
        return res.status(404).json({message : "Transactions not found"});
      }
      return res.status(200).json({message : "Transactions found",transactions});
    } else //custome date filter 
    {
      const startDate = new Date(date[0]);
      const endDate = new Date(date[1]);
      const transactions = await Transactions.find({date : {$gte : startDate,$lte :endDate}}).populate("senderId ","name");
      if(transactions.length === 0) {
        return res.status(404).json({message : "Transactions not found"});
      }
      return res.status(200).json({message : "Transactions found",transactions});
    }
  } catch (error) {
    console.log(error);
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