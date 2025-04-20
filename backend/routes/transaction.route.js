import express from "express";
import verifyToken from "../middleware/auth.js";
const transactionRouter = express.Router();
transactionRouter.get("/getTransactions",verifyToken,getUserTransactions);
transactionRouter.post("/",verifyToken,addTransaction);
transactionRouter.get("/:id", verifyToken, getTransactionById);
transactionRouter.put("/:id", verifyToken, updateTransaction);
export default transactionRouter;