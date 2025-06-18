import express from "express";
import { 
  addRecurringExpense, 
  getUserRecurringExpenses, 
  getRecurringExpenseById,
  updateRecurringExpense, 
  deleteRecurringExpense 
} from "../controllers/recurringExpense.controller.js";
import verifyToken from "../middleware/auth.js";
import upload from "../config/multer.js";

const recurringExpenseRouter = express.Router();


recurringExpenseRouter.get("/", verifyToken, getUserRecurringExpenses);
recurringExpenseRouter.get("/:recurringExpenseId", verifyToken, getRecurringExpenseById);
recurringExpenseRouter.post("/", verifyToken, upload.single("reciept"), addRecurringExpense);
recurringExpenseRouter.put("/:recurringExpenseId", verifyToken, upload.single("reciept"), updateRecurringExpense);
recurringExpenseRouter.delete("/:recurringExpenseId", verifyToken, deleteRecurringExpense);

export default recurringExpenseRouter;
