import express from "express";
import verifyToken from "../middleware/auth.js";
import { userLogin,userRegister,userUpdatePassword,userDeleteAccount,getUsers } from "../controllers/user.controller.js";
const userRouter = express.Router();

userRouter.post("/register",userRegister);
userRouter.post("/login",userLogin);
userRouter.patch("/updatePassword",verifyToken,userUpdatePassword);
userRouter.delete("/deleteAccount",verifyToken,userDeleteAccount);
userRouter.get("/getUsers",verifyToken,getUsers);

export default userRouter;