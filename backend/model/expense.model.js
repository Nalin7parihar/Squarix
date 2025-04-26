import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema({
  title : {
    type : String,
    required : true
  },
  amount : {
    type : Number,
    required : true
  },
  senderId : {
    type : mongoose.Schema.Types.ObjectId,
    ref : "Users",
    required : true
  },
  participants: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
      },
      share: {
        type: Number,
      },
      isSettled : {
        type: Boolean,
        default: false,
      },
      transactionId : {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Transactions",
        default: null,
      }
    },
  ],
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Group",
    default: null,
  },
  isGroupExpense: {
    type: Boolean,
    default: false,
  },
  category : {
    type : String,
    required : true
  },
  reciept : {
    type: String,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

const Expense = mongoose.model("Expense", expenseSchema);
export default Expense;