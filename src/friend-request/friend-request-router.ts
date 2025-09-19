import express from "express";
import { friendRequestController } from "./friend-request-controller";

export const createFriendRequestRouter = () => {
    const friendRequestRouter = express.Router();

    friendRequestRouter.post("/send/:to", friendRequestController.send);
    friendRequestRouter.post("/accept/:id", friendRequestController.accept);

    return friendRequestRouter;
};
