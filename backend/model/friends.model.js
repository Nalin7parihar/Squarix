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
  transactions: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Transactions",
    },
  ],
}, { timestamps: true });

// Unique constraint on (user, friend) pair
friendSchema.index({ user: 1, friend: 1 }, { unique: true });

const Friend = mongoose.model("Friend", friendSchema);

export default Friend;
