import mongoose from "mongoose";
const groupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  members: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users"
    }
  ],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users"
  },
  totalExpense : {
    type : Number,
    default : 0
  },
  expenses : [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Expense"
    }
  ],
});

const group =  mongoose.model("Group",groupSchema);
export default group;