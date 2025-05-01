import Friend from "../model/friends.model.js";
import users from "../model/user.model.js";

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
  const { id } = req.params; // id of Friend document you want to delete
  try {
    const friend = await Friend.findById(id);

    if (!friend) {
      return res.status(404).json({ message: "Friend not found" });
    }

    const user = await users.findById(req.user.id);

    if (!user.friends.includes(friend._id.toString())) {
      return res.status(400).json({ message: "Friend not in your friend list" });
    }

    await Friend.findByIdAndDelete(id);

    user.friends = user.friends.filter(friendId => friendId.toString() !== friend._id.toString());
    await user.save();

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

export { getFriends, addFriend, deleteFriend, updateFriend };
