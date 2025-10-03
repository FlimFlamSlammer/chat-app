import express from "express";
import { friendRequestController } from "./friend-request-controller";
import { authController } from "~/auth/auth-controller";

export const createFriendRequestRouter = () => {
    const friendRequestRouter = express.Router();

    friendRequestRouter.use(authController.middleware);
    friendRequestRouter.post("/send/:to", friendRequestController.send);
    friendRequestRouter.post("/accept/:id", friendRequestController.accept);
    friendRequestRouter.get("/incoming", friendRequestController.getIncoming);
    friendRequestRouter.get("/outgoing", friendRequestController.getOutgoing);

    return friendRequestRouter;
};
