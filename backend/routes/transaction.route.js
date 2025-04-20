import express from "express";
import verifyToken from "../middleware/auth.js";
import { getUserTransactions,addTransaction,updateTransaction } from "../controllers/transaction.controller.js";
const transactionRouter = express.Router();
transactionRouter.get("/getTransactions",verifyToken,getUserTransactions);
transactionRouter.post("/",verifyToken,addTransaction);
transactionRouter.put("/:id", verifyToken, updateTransaction);
transactionRouter.get("/getSummary",verifyToken,getTransactionSummary);
export default transactionRouter;