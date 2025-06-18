import express from "express";
import verifyToken from "../middleware/auth.js";
import { getFriends, addFriend, deleteFriend, getFriendExpenses } from "../controllers/friends.controller.js";

const friendRouter = express.Router();

friendRouter.get("/", verifyToken, getFriends);
friendRouter.post("/", verifyToken, addFriend);
friendRouter.delete("/:id", verifyToken, deleteFriend);//yet to be implemented
friendRouter.get("/:id/expenses", verifyToken, getFriendExpenses); // New route for getting friend expenses

export default friendRouter;