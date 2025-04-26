import express from "express";

const friendRouter = express.Router();

friendRouter.get("/",getFriends);
friendRouter.post("/",addFriend);
friendRouter.delete("/:id",deleteFriend);
friendRouter.patch("/:id",updateFriend);

export default friendRouter;