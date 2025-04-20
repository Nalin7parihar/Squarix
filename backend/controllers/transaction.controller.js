import Transactions from "../model/transaction.model.js";


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
export {getUserTransactions,addTransaction,updateTransaction,getTransactionSummary};