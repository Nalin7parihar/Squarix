import Group from "../model/group.model.js";
import User from "../model/user.model.js";

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

// Get details of a specific group
 const getGroupDetails = async (req, res) => {
  try {
    const { groupId } = req.params;
    
    const group = await Group.findById(groupId)
      .populate('members', 'name email')
      .populate('expenses')
      .populate('createdBy', 'name email');

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found"
      });
    }

    res.status(200).json({
      success: true,
      group
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching group details",
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

export {deleteGroup,removeMemberFromGroup,addMemberToGroup,getAllGroups,getGroupDetails,createGroup};