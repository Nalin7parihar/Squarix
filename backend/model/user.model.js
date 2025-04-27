import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  friends: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Friend"
    }
  ],
  groups: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group"
    }
  ],
  transactions: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Transactions"
    }
  ],
  expenses: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Expense"
    }
  ],
}, { timestamps: true });  // Always nice to add timestamps

const Users = mongoose.model("Users", userSchema);
export default Users;
