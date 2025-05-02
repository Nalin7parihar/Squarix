import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
  amount : {
    type : Number,
    required : true
  },
  date : {
    type : Date,
    default : Date.now
  },
  description : {
    type : String,
    required : true
  },
  category : {
    type : String,
    required : true
  },
  senderId : {
    type : mongoose.Schema.Types.ObjectId,
    ref : "Users",
    required : true
  },
  receiverId : {
    type : mongoose.Schema.Types.ObjectId,
    ref : "Users",
    required : true
  },
  isSettled : {
    type : Boolean,
    default : false
  },
  expenseId : {
    type : mongoose.Schema.Types.ObjectId,
    ref : "Expense",
    default : null
  }
});

const Transactions = mongoose.model("Transactions",transactionSchema);
export default Transactions;