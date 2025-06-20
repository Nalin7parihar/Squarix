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

    // Return the friends array in the expected format
    res.status(200).json({ 
      message: "Friends retrieved successfully",
      friends: friends || []
    });
  } catch (error) {
    console.error('Error in getFriends:', error);
    res.status(500).json({ 
      message: "Internal server error",
      error: error.message 
    });
  }
};

const addFriend = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await users.findById(req.user.id);
    const friend = await users.findOne({ email: email.toLowerCase().trim() });

    if (!friend) {
      return res.status(404).json({ message: "User with this email not found" });
    }

    if (friend._id.toString() === req.user.id) {
      return res.status(400).json({ message: "You cannot add yourself as a friend" });
    }    // Check if friendship already exists (either direction)
    const existingFriendship = await Friend.findOne({
      $or: [
        { user: req.user.id, friend: friend._id },
        { user: friend._id, friend: req.user.id }
      ]
    });

    if (existingFriendship) {
      return res.status(400).json({ message: "This person is already your friend" });
    }

    // Create the friend relationship (User A -> User B)
    const newFriend = await Friend.create({
      user: req.user.id,
      friend: friend._id
    });

    // Create the reciprocal friend relationship (User B -> User A)
    const reciprocalFriend = await Friend.create({
      user: friend._id,
      friend: req.user.id
    });

    // Add to current user's friends array
    user.friends.push(newFriend._id);
    await user.save();

    // Add to friend's friends array
    friend.friends.push(reciprocalFriend._id);
    await friend.save();

    // Populate the friend data for the response
    const populatedFriend = await Friend.findById(newFriend._id)
      .populate({
        path: "friend",
        select: "name email"
      });

    res.status(201).json({ 
      message: "Friend added successfully",
      friend: populatedFriend
    });
  } catch (error) {
    console.error("Error in addFriend:", error);
    res.status(500).json({ 
      message: "Internal server error",
      error: error.message 
    });
  }
}

const deleteFriend = async (req, res) => {
  const { id } = req.params; // id of the Friend document
  try {
    // Find the Friend document
    const friendRelation = await Friend.findById(id);

    if (!friendRelation) {
      return res.status(404).json({ message: "Friend relationship not found" });
    }

    // Verify the current user owns this friend relationship
    if (friendRelation.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to delete this friend relationship" });
    }

    const friendUserId = friendRelation.friend;

    // Check for unsettled expenses between the two users
    const unsettledExpensesAsSender = await Expense.find({
      senderId: req.user.id,
      'participants.user': friendUserId,
      'participants.isSettled': false
    });

    const unsettledExpensesAsReceiver = await Expense.find({
      senderId: friendUserId,
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

    // Find the reciprocal Friend document BEFORE deleting
    const reciprocalRelation = await Friend.findOne({
      user: friendUserId,
      friend: req.user.id
    });

    // Delete both friend relationships (A->B and B->A)
    await Friend.deleteMany({
      $or: [
        { user: req.user.id, friend: friendUserId },
        { user: friendUserId, friend: req.user.id }
      ]
    });

    // Remove from current user's friends array
    await users.findByIdAndUpdate(req.user.id, {
      $pull: { friends: id }
    });

    // Remove from friend's friends array
    if (reciprocalRelation) {
      await users.findByIdAndUpdate(friendUserId, {
        $pull: { friends: reciprocalRelation._id }
      });
    }

    res.status(200).json({ message: "Friend deleted successfully from both users" });
  } catch (error) {
    console.error("Error in deleteFriend:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
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

export { getFriends, addFriend, deleteFriend, getFriendExpenses };
