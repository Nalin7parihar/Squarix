import express from "express";
import { getUserExpenses, addExpense, getExpenseSummary, deleteExpense,getExpenseById } from "../controllers/expense.controller.js";
import verifyToken from "../middleware/auth.js";
import upload from "../config/multer.js";
const expenseRouter = express.Router();

expenseRouter.get('/getExpenses',verifyToken,getUserExpenses);
expenseRouter.post('/',verifyToken,upload.single('reciept'),addExpense);
expenseRouter.post('/getSummary',verifyToken,getExpenseSummary);
expenseRouter.delete('/:expenseId',verifyToken,deleteExpense);
expenseRouter.get('/:id',verifyToken,getExpenseById);
export default expenseRouter;