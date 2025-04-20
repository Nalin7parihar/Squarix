import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name : {
    type : String,
    required : true
  },
  email : {
    type : String,
    required : true,
    unique : true
  },
  password  : {
    type : String,
    required : true
  },
  friends : {
    type : mongoose.Schema.Types.ObjectId,
    ref : "Friend",
    default : []
  },
  groups : {
    type : mongoose.Schema.Types.ObjectId,
    ref : "Group",
    default : []
  },
  transactions : {
    type : mongoose.Schema.Types.ObjectId,
    ref : "Transactions",
    default : []
  },
  expenses : {
    type : mongoose.Schema.Types.ObjectId,
    ref : "Expense",
    default : [],
  },
})

const users = mongoose.model("Users",userSchema);
export default users;