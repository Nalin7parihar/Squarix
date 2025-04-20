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
export {getUserTransactions,addTransaction};