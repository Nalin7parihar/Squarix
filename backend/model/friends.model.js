import mongoose from "mongoose";

const friendSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
    required: true,
  },
  friend: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  status : {
    type : String,
    enum : ["pending", "accepted", "rejected"]
  },
});

const Friend = mongoose.model("Friend", friendSchema);
export default Friend;
