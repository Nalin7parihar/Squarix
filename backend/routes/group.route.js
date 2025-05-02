import express from "express";
import { createGroup, getGroupDetails, getAllGroups, addMemberToGroup, removeMemberFromGroup, deleteGroup, addGroupExpense, getGroupExpenses } from "../controllers/group.controller.js";
import verifyToken from "../middleware/auth.js";

const router = express.Router();

// Group routes
router.post("/", verifyToken, createGroup); // Changed from /create
router.get("/details/:groupId", verifyToken, getGroupDetails);
router.get("/", verifyToken, getAllGroups); // Changed from /all
router.post("/:groupId/members", verifyToken, addMemberToGroup); // Changed from /add-member/:groupId
router.delete("/:groupId/members", verifyToken, removeMemberFromGroup); // Changed from /remove-member/:groupId
router.delete("/:groupId", verifyToken, deleteGroup); // Changed from /delete/:groupId

// Group expense routes
router.post("/:groupId/expenses", verifyToken, addGroupExpense);
router.get("/:groupId/expenses", verifyToken, getGroupExpenses);

export default router;