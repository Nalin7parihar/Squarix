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
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const group =  mongoose.model("Group",groupSchema);
export default group;