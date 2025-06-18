import mongoose, { mongo } from "mongoose";


const recurringExpenseSchema = new mongoose.Schema({
  senderId : {
    type : mongoose.Schema.Types.ObjectId,
    ref : "User"
  },
  title : String,
  amount : Number,
  category : {
    type: String,
    required : true
  },
  frequency : {
    type: String,
    enum : ["daily","weekly","monthly"],
    required : true
  },
  participants : [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
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
        ref: "Transaction",
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
  nextDueDate : {
    type : Date,
    required : true
  },
  autoAdd : {
    type : Boolean,
    default : true
  },
  createAt : {
    type : Date,
    default : Date.now
  },
})

export const recurringExpense = mongoose.model("RecurringExpense",recurringExpenseSchema);