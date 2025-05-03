import Friend from "../model/friends.model.js";
import users from "../model/user.model.js";
import Expense from "../model/expense.model.js";

const getFriends = async (req, res) => {
  try {
    const { id } = req.user;

    const friends = await Friend.find({ user: id })
      .populate({
        path: "friend",
        select: "name email"
      })
      .lean();

    if (!friends) {
      return res.status(200).json([]); // Return empty array instead of 404
    }

    res.status(200).json(friends);
  } catch (error) {
    console.error('Error in getFriends:', error);
    res.status(500).json({ 
      message: "Internal server error",
      error: error.message 
    });
  }
};

const addFriend = async (req,res) => {
  try {
    const {id} = req.body;
    const user = await users.findById(req.user.id);
    const friend = await users.findById(id);

    if (!friend) {
      return res.status(404).json({ message: "Friend not found" });
    }

    if (user.friends.includes(id)) {
      return res.status(400).json({ message: "Friend already added" });
    }
    const newFriend = await Friend.create({user : req.user.id, friend : id});

    user.friends.push(id);
    await user.save();

    res.status(200).json({ message: "Friend added successfully" ,newFriend});
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
}

const deleteFriend = async (req, res) => {
  const { id } = req.params; // id of the friend user, not Friend document
  try {
    // Find the Friend document that connects the current user and the friend
    const friendRelation = await Friend.findOne({
      user: req.user.id,
      friend: id
    });

    if (!friendRelation) {
      return res.status(404).json({ message: "Friend relationship not found" });
    }

    // Check for unsettled expenses where current user is the sender and friend is a participant
    const unsettledExpensesAsSender = await Expense.find({
      senderId: req.user.id,
      'participants.user': id,
      'participants.isSettled': false
    });

    // Check for unsettled expenses where friend is the sender and current user is a participant
    const unsettledExpensesAsReceiver = await Expense.find({
      senderId: id,
      'participants.user': req.user.id,
      'participants.isSettled': false
    });

    // If there are any unsettled expenses in either direction, don't allow deletion
    if (unsettledExpensesAsSender.length > 0 || unsettledExpensesAsReceiver.length > 0) {
      return res.status(400).json({ 
        message: "Cannot delete friend. You have unsettled expenses with this person.",
        unsettledCount: unsettledExpensesAsSender.length + unsettledExpensesAsReceiver.length
      });
    }

    const user = await users.findById(req.user.id);

    // Remove the friend from the user's friends array
    user.friends = user.friends.filter(friendId => friendId.toString() !== id);
    await user.save();

    // Delete the Friend document
    await Friend.findByIdAndDelete(friendRelation._id);

    res.status(200).json({ message: "Friend deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
}

const updateFriend = async (req,res) => {
  const { id } = req.params; // id of Friend document you want to update
  const { friendId,transactionId } = req.body; // new friend ID to update to

  try {
    const friend = await Friend.findById(id);

    if (!friend) {
      return res.status(404).json({ message: "Friend not found" });
    }

    const user = await users.findById(req.user.id);

    if (!user.friends.includes(friend._id.toString())) {
      return res.status(400).json({ message: "Friend not in your friend list" });
    }

    friend.friend = friendId;
    friend.transactions.push(transactionId); // assuming you want to add a transaction ID to the friend document  
    await friend.save();

    res.status(200).json({ message: "Friend updated successfully", friend });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// Get expenses shared with a specific friend
const getFriendExpenses = async (req, res) => {
  try {
    const { id } = req.params; // Friend's user ID
    const userId = req.user.id; // Current user ID
    
    // Find expenses where both users are involved (either as sender or participant)
    const expenses = await Expense.find({
      $or: [
        // Case 1: Current user is sender, friend is participant
        { 
          senderId: userId,
          'participants.user': id 
        },
        // Case 2: Friend is sender, current user is participant
        { 
          senderId: id,
          'participants.user': userId 
        }
      ]
    })
    .populate('senderId', 'name email')
    .populate('participants.user', 'name email')
    .populate('groupId')
    .sort({ createdAt: -1 });
    
    // Calculate balances for this friendship
    let friendOwesToUser = 0;
    let userOwesToFriend = 0;
    
    expenses.forEach(expense => {
      // If current user is the sender
      if (expense.senderId._id.toString() === userId) {
        const friendParticipant = expense.participants.find(
          p => p.user._id.toString() === id && !p.isSettled
        );
        
        if (friendParticipant) {
          friendOwesToUser += friendParticipant.share;
        }
      }
      // If friend is the sender
      else if (expense.senderId._id.toString() === id) {
        const userParticipant = expense.participants.find(
          p => p.user._id.toString() === userId && !p.isSettled
        );
        
        if (userParticipant) {
          userOwesToFriend += userParticipant.share;
        }
      }
    });
    
    // Update the friend relationship with the calculated balances
    await Friend.findOneAndUpdate(
      { user: userId, friend: id },
      { 
        $set: { 
          totalOwed: friendOwesToUser,
          totalOwes: userOwesToFriend 
        } 
      },
      { upsert: true }
    );
    
    res.status(200).json({
      message: expenses.length > 0 ? "Friend expenses retrieved successfully" : "No expenses found with this friend",
      expenses,
      balances: {
        friendOwes: friendOwesToUser,
        youOwe: userOwesToFriend,
        netBalance: friendOwesToUser - userOwesToFriend
      }
    });
  } catch (error) {
    console.error("Get friend expenses error:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

export { getFriends, addFriend, deleteFriend, updateFriend, getFriendExpenses };
