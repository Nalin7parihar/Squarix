import { v2 as cloudinary } from "cloudinary";
import { recurringExpense } from "../model/recurringExpense.model.js";


const addRecurringExpense = async (req, res) => {
  try {
    const { id } = req.user;
    const { title, amount, groupId, category, nextDueDate, frequency } = req.body;
    let { participants } = req.body;
    
    if (!title || !amount || !participants || !frequency || !nextDueDate) {
      return res.status(400).json({ message: "Please provide all required fields" });
    }
    
    if (typeof participants === 'string') {
      participants = JSON.parse(participants);
    }
    
    // Validate participants structure
    if (!Array.isArray(participants)) {
      return res.status(400).json({ message: "Participants must be an array" });
    }
    
    // Validate frequency
    if (!['daily', 'weekly', 'monthly'].includes(frequency)) {
      return res.status(400).json({ message: "Frequency must be daily, weekly, or monthly" });
    }
    
    // Validate nextDueDate
    const dueDate = new Date(nextDueDate);
    if (isNaN(dueDate.getTime()) || dueDate <= new Date()) {
      return res.status(400).json({ message: "Next due date must be a valid future date" });
    }

    // Ensure each participant has a user and share property
    participants = participants.map(participant => {
      return {
        user: participant.user,
        share: parseFloat(participant.share),
        isSettled: participant.isSettled || false,
        transactionId: participant.transactionId || null
      };
    });
    
    const totalShares = participants.reduce((sum, participant) => sum + participant.share, 0);
    if (Math.abs(totalShares - parseFloat(amount)) > 0.01) { // Allow small floating point differences
      return res.status(400).json({
        message: "Sum of shares must equal total amount"
      });
    }

    const isGroupExpense = groupId ? true : false;

    let reciept = null;
    if (req.file && req.file.buffer) {
      const fileStr = req.file.buffer.toString('base64');
      const fileFormat = `data:${req.file.mimetype};base64,${fileStr}`;

      const uploadResult = await cloudinary.uploader.upload(fileFormat, {
        folder: 'recurring-expenses',
        resource_type: 'auto'
      });
      if (!uploadResult) return res.status(400).json({ message: "Error in uploading file" });
      reciept = uploadResult.secure_url;
    }

    const newRecurringExpense = await recurringExpense.create({
      title,
      amount: parseFloat(amount),
      senderId: id,
      participants,
      groupId,
      isGroupExpense,
      category,
      reciept,
      frequency,
      nextDueDate: dueDate,
      autoAdd: req.body.autoAdd !== undefined ? req.body.autoAdd : true // Default to true for recurring expenses
    });
    
    if (!newRecurringExpense) {
      return res.status(400).json({ message: "Error in creating recurring expense" });
    }
    
    // Populate recurring expense details before sending the response
    const populatedRecurringExpense = await recurringExpense.findById(newRecurringExpense._id)
      .populate('senderId', 'name email')
      .populate('participants.user', 'name email')
      .populate('groupId');
      
    return res.status(201).json({
      message: "Recurring expense created successfully", 
      recurringExpense: populatedRecurringExpense
    });
    
  } catch (error) {
    console.error("Error adding recurring expense:", error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
}

const getUserRecurringExpenses = async (req, res) => {
  try {
    const { id } = req.user;
    const recurringExpenses = await recurringExpense.find({
      $or: [
        { senderId: id },
        { 'participants.user': id }
      ]
    })
    .populate('senderId', 'name email') 
    .populate('participants.user', 'name email')
    .populate('groupId') // Include group information for group expenses
    .sort({ createAt: -1 }); // Sort by creation date, newest first
    
    // Return empty array instead of 404 error when no recurring expenses found
    return res.status(200).json({
      message: recurringExpenses.length > 0 ? "Recurring expenses fetched successfully" : "No recurring expenses found", 
      recurringExpenses: recurringExpenses || []
    });
  } catch (error) {
    console.error("Error fetching recurring expenses:", error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
}

const getRecurringExpenseById = async (req, res) => {
  try {
    const { recurringExpenseId } = req.params;
    const populatedRecurringExpense = await recurringExpense.findById(recurringExpenseId)
      .populate('senderId', 'name email')
      .populate('participants.user', 'name email')
      .populate('groupId');
      
    if (!populatedRecurringExpense) {
      return res.status(404).json({ message: "Recurring expense not found" });
    }
    
    return res.status(200).json({
      message: "Recurring expense fetched successfully",
      recurringExpense: populatedRecurringExpense
    });

  } catch (error) {
    console.error("Error fetching recurring expense by ID:", error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
}

const updateRecurringExpense = async (req, res) => {
  try {
    const { id } = req.user;
    const { recurringExpenseId } = req.params;
    const { title, amount, groupId, category, nextDueDate, frequency, autoAdd } = req.body;
    let { participants } = req.body;
    
    // Find the existing recurring expense
    const existingRecurringExpense = await recurringExpense.findById(recurringExpenseId);
    if (!existingRecurringExpense) {
      return res.status(404).json({ message: "Recurring expense not found" });
    }
    
    // Check if user is authorized to update (only sender can update)
    if (existingRecurringExpense.senderId.toString() !== id) {
      return res.status(403).json({ message: "You are not authorized to update this recurring expense" });
    }
    
    // Prepare update object with only provided fields
    const updateData = {};
    
    if (title) updateData.title = title;
    if (amount) updateData.amount = parseFloat(amount);
    if (category) updateData.category = category;
    if (autoAdd !== undefined) updateData.autoAdd = autoAdd;
    if (groupId !== undefined) {
      updateData.groupId = groupId;
      updateData.isGroupExpense = groupId ? true : false;
    }
    
    // Validate and update frequency if provided
    if (frequency) {
      if (!['daily', 'weekly', 'monthly'].includes(frequency)) {
        return res.status(400).json({ message: "Frequency must be daily, weekly, or monthly" });
      }
      updateData.frequency = frequency;
    }
    
    // Validate and update nextDueDate if provided
    if (nextDueDate) {
      const dueDate = new Date(nextDueDate);
      if (isNaN(dueDate.getTime()) || dueDate <= new Date()) {
        return res.status(400).json({ message: "Next due date must be a valid future date" });
      }
      updateData.nextDueDate = dueDate;
    }
    
    // Handle participants update if provided
    if (participants) {
      if (typeof participants === 'string') {
        participants = JSON.parse(participants);
      }
      
      // Validate participants structure
      if (!Array.isArray(participants)) {
        return res.status(400).json({ message: "Participants must be an array" });
      }
      
      // Ensure each participant has a user and share property
      participants = participants.map(participant => {
        return {
          user: participant.user,
          share: parseFloat(participant.share),
          isSettled: participant.isSettled || false,
          transactionId: participant.transactionId || null
        };
      });
      
      // Validate total shares equal amount (use updated amount or existing amount)
      const totalShares = participants.reduce((sum, participant) => sum + participant.share, 0);
      const amountToCheck = updateData.amount || existingRecurringExpense.amount;
      if (Math.abs(totalShares - amountToCheck) > 0.01) {
        return res.status(400).json({
          message: "Sum of shares must equal total amount"
        });
      }
      
      updateData.participants = participants;
    }
    
    // Handle receipt upload if provided
    if (req.file && req.file.buffer) {
      const fileStr = req.file.buffer.toString('base64');
      const fileFormat = `data:${req.file.mimetype};base64,${fileStr}`;

      const uploadResult = await cloudinary.uploader.upload(fileFormat, {
        folder: 'recurring-expenses',
        resource_type: 'auto'
      });
      if (!uploadResult) return res.status(400).json({ message: "Error in uploading file" });
      updateData.reciept = uploadResult.secure_url;
    }
    
    // Update the recurring expense
    const updatedRecurringExpense = await recurringExpense.findByIdAndUpdate(
      recurringExpenseId,
      updateData,
      { new: true }
    )
    .populate('senderId', 'name email')
    .populate('participants.user', 'name email')
    .populate('groupId');
    
    if (!updatedRecurringExpense) {
      return res.status(400).json({ message: "Error in updating recurring expense" });
    }
    
    return res.status(200).json({
      message: "Recurring expense updated successfully",
      recurringExpense: updatedRecurringExpense
    });
    
  } catch (error) {
    console.error("Error updating recurring expense:", error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
}

const deleteRecurringExpense = async (req, res) => {
  try {
    const { id } = req.user;
    const { recurringExpenseId } = req.params;
    
    const recurringExpenseDoc = await recurringExpense.findById(recurringExpenseId);
    if (!recurringExpenseDoc) {
      return res.status(404).json({ message: "Recurring expense not found" });
    }
    
    // Check if user is authorized to delete (only sender can delete)
    if (recurringExpenseDoc.senderId.toString() !== id) {
      return res.status(403).json({ message: "You are not authorized to delete this recurring expense" });
    }
    
    await recurringExpense.findByIdAndDelete(recurringExpenseId);
    return res.status(200).json({ message: "Recurring expense deleted successfully" });
    
  } catch (error) {
    console.error("Error deleting recurring expense:", error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
}

export { 
  addRecurringExpense, 
  getUserRecurringExpenses, 
  getRecurringExpenseById,
  updateRecurringExpense, 
  deleteRecurringExpense 
};
