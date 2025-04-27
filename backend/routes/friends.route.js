import express from "express";
import verifyToken from "../middleware/auth.js";
import { getFriends, addFriend, deleteFriend, updateFriend } from "../controllers/friends.controller.js";

const friendRouter = express.Router();

friendRouter.get("/", verifyToken, getFriends);
friendRouter.post("/", verifyToken, addFriend);
friendRouter.delete("/:id", verifyToken, deleteFriend);
friendRouter.patch("/:id", verifyToken, updateFriend);

export default friendRouter;