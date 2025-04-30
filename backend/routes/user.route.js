import express from "express";
import { userLogin, userRegister, userUpdatePassword, userDeleteAccount, getUsers, userLogout, getCurrentUser } from "../controllers/user.controller.js";
import verifyToken from "../middleware/auth.js";
const router = express.Router();

// Public routes
router.post("/register", userRegister);
router.post("/login", userLogin);

// Protected routes
router.use(verifyToken);
router.get("/me", getCurrentUser);
router.put("/updatePassword", userUpdatePassword);
router.delete("/deleteAccount", userDeleteAccount);
router.post("/logout", userLogout);
router.get("/users", getUsers);

export default router;