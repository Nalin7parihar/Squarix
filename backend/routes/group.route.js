import express from "express";
import { createGroup, getGroupDetails, getAllGroups, addMemberToGroup, removeMemberFromGroup, deleteGroup } from "../controllers/group.controller.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

// Group routes
router.post("/create", verifyToken, createGroup);
router.get("/details/:groupId", verifyToken, getGroupDetails);
router.get("/all", verifyToken, getAllGroups);
router.post("/add-member/:groupId", verifyToken, addMemberToGroup);
router.delete("/remove-member/:groupId", verifyToken, removeMemberFromGroup);
router.delete("/delete/:groupId", verifyToken, deleteGroup);

export default router;