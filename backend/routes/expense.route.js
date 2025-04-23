import express from "express";
import { getUserExpenses, addExpense, updateExpense, getExpenseSummary, filterExpenses, deleteExpense } from "../controllers/expense.controller.js";
import verifyToken from "../middleware/auth.js";
const expenseRouter = express.Router();

expenseRouter.get('/getExpenses',verifyToken,getUserExpenses);
expenseRouter.post('/',verifyToken,addExpense);
expenseRouter.put('/:id',verifyToken,updateExpense);
expenseRouter.get('/getSummary',verifyToken,getExpenseSummary);
expenseRouter.get('/filter',verifyToken,filterExpenses);
expenseRouter.delete('/:id',verifyToken,deleteExpense);

export default expenseRouter;