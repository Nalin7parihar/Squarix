import Group from "../model/group.model.js";
import User from "../model/user.model.js";
import Expense from "../model/expense.model.js";
import Transactions from "../model/transaction.model.js";

// Create a new group
 const createGroup = async (req, res) => {
  try {
    const { name, members } = req.body;
    const userId = req.user.id;

    // Create new group with current user as creator and member
    const group = new Group({
      name,
      members: [...members, userId],
      createdBy: userId,
    });

    await group.save();

    // Populate members details
    const populatedGroup = await group.populate('members', 'name email');
    
    res.status(201).json({
      success: true,
      message: "Group created successfully",
      group: populatedGroup
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating group",
      error: error.message
    });
  }
};

// Get all groups for a user
 const getAllGroups = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const groups = await Group.find({ members: userId })
      .populate('members', 'name email')
      .populate('createdBy', 'name email');

    res.status(200).json({
      success: true,
      groups
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching groups",
      error: error.message
    });
  }
};

// Add a member to the group
 const addMemberToGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { memberId } = req.body;
    const userId = req.user.id;

    const group = await Group.findById(groupId);
    
    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found"
      });
    }

    // Check if user is authorized to add members
    if (group.createdBy.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to add members"
      });
    }

    // Check if member exists
    const memberExists = await User.findById(memberId);
    if (!memberExists) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Check if member is already in group
    if (group.members.includes(memberId)) {
      return res.status(400).json({
        success: false,
        message: "User is already a member of this group"
      });
    }

    group.members.push(memberId);
    await group.save();
    
    const updatedGroup = await group.populate('members', 'name email');

    res.status(200).json({
      success: true,
      message: "Member added successfully",
      group: updatedGroup
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error adding member",
      error: error.message
    });
  }
};

// Remove a member from the group
 const removeMemberFromGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { memberId } = req.body;
    const userId = req.user.id;

    const group = await Group.findById(groupId);
    
    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found"
      });
    }

    // Check if user is authorized to remove members
    if (group.createdBy.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to remove members"
      });
    }

    // Cannot remove the creator of the group
    if (memberId === group.createdBy.toString()) {
      return res.status(400).json({
        success: false,
        message: "Cannot remove the group creator"
      });
    }

    // Remove member
    group.members = group.members.filter(
      member => member.toString() !== memberId
    );
    
    await group.save();
    
    const updatedGroup = await group.populate('members', 'name email');

    res.status(200).json({
      success: true,
      message: "Member removed successfully",
      group: updatedGroup
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error removing member",
      error: error.message
    });
  }
};

// Delete a group
 const deleteGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user.id;

    const group = await Group.findById(groupId);
    
    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found"
      });
    }

    // Check if user is authorized to delete group
    if (group.createdBy.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete group"
      });
    }

    await Group.findByIdAndDelete(groupId);

    res.status(200).json({
      success: true,
      message: "Group deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting group",
      error: error.message
    });
  }
};

// Add an expense to a group
const addGroupExpense = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user.id;
    const { title, amount, category, senderId, participants } = req.body;
    
    // Verify the group exists
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found"
      });
    }
    
    // Verify the user is a member of the group
    if (!group.members.includes(userId)) {
      return res.status(403).json({
        success: false,
        message: "You must be a member of this group to add expenses"
      });
    }
    
    // Parse participants if it's a string
    let parsedParticipants;
    if (typeof participants === 'string') {
      try {
        parsedParticipants = JSON.parse(participants);
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: "Invalid participants format"
        });
      }
    } else {
      parsedParticipants = participants;
    }
    
    // Validate participants structure
    if (!Array.isArray(parsedParticipants)) {
      return res.status(400).json({
        success: false,
        message: "Participants must be an array"
      });
    }
    
    // Normalize participant data
    const normalizedParticipants = parsedParticipants.map(participant => ({
      user: participant.user,
      share: parseFloat(participant.share),
      isSettled: false,
      transactionId: null
    }));
    
    // Validate all participants are members of the group
    const allMembersValid = normalizedParticipants.every(participant => 
      group.members.some(member => member.toString() === participant.user)
    );
    
    if (!allMembersValid) {
      return res.status(400).json({
        success: false,
        message: "All participants must be members of the group"
      });
    }
    
    // Validate total shares equal amount
    const totalShares = normalizedParticipants.reduce((sum, participant) => sum + participant.share, 0);
    if (Math.abs(totalShares - parseFloat(amount)) > 0.01) {
      return res.status(400).json({
        success: false,
        message: "Sum of shares must equal total amount"
      });
    }
    
    // Use the provided sender ID or the current user's ID
    const actualSenderId = senderId || userId;
    
    // Check if the sender is a member of the group
    if (!group.members.some(member => member.toString() === actualSenderId)) {
      return res.status(400).json({
        success: false,
        message: "The payer must be a member of the group"
      });
    }
    
    // Create the expense
    const expense = await Expense.create({
      title,
      amount: parseFloat(amount),
      senderId: actualSenderId,
      participants: normalizedParticipants,
      groupId,
      isGroupExpense: true,
      category
    });
    
    if (!expense) {
      return res.status(500).json({
        success: false,
        message: "Failed to create expense"
      });
    }
    
    // Update the group's expenses and totalExpense
    group.expenses.push(expense._id);
    group.totalExpense += parseFloat(amount);
    await group.save();
    
    // Create transactions for each participant
    const updatedParticipants = [];
    for (const participant of normalizedParticipants) {
      // Skip participants with zero share or the sender
      if (participant.share <= 0 || participant.user === actualSenderId) {
        updatedParticipants.push(participant);
        continue;
      }
      
      // Create a transaction for this participant
      const transaction = await Transactions.create({
        amount: participant.share,
        date: new Date(),
        description: title,
        category,
        senderId: participant.user, // The participant owes money
        receiverId: actualSenderId, // To the expense creator
        isSettled: false,
        groupId
      });
      
      // Update the participant with the transaction ID
      updatedParticipants.push({
        ...participant,
        transactionId: transaction._id
      });
    }
    
    // Update the expense with transaction IDs
    if (updatedParticipants.length > 0) {
      await Expense.findByIdAndUpdate(expense._id, {
        participants: updatedParticipants
      });
    }
    
    // Populate the expense details
    const populatedExpense = await Expense.findById(expense._id)
      .populate('senderId', 'name email')
      .populate('participants.user', 'name email')
      .populate('groupId');
    
    res.status(201).json({
      success: true,
      message: "Group expense added successfully",
      expense: populatedExpense
    });
    
  } catch (error) {
    console.error("Add group expense error:", error);
    res.status(500).json({
      success: false,
      message: "Error adding group expense",
      error: error.message
    });
  }
};

// Get all expenses for a specific group
const getGroupExpenses = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user.id;
    
    // Verify the group exists
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found"
      });
    }
    
    // Verify the user is a member of the group
    if (!group.members.includes(userId)) {
      return res.status(403).json({
        success: false,
        message: "You must be a member of this group to view expenses"
      });
    }
    
    // Get all expenses for this group
    const expenses = await Expense.find({ groupId, isGroupExpense: true })
      .populate('senderId', 'name email')
      .populate('participants.user', 'name email')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      message: expenses.length > 0 ? "Group expenses retrieved successfully" : "No expenses found for this group",
      expenses
    });
    
  } catch (error) {
    console.error("Get group expenses error:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving group expenses",
      error: error.message
    });
  }
};

export {deleteGroup, removeMemberFromGroup, addMemberToGroup, getAllGroups, createGroup, addGroupExpense, getGroupExpenses};