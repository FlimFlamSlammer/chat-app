import express from "express";
import { authController } from "~/auth/auth-controller";
import { friendController } from "./friend-controller";

export function createFriendRouter() {
    const friendRouter = express.Router();

    friendRouter.use(authController.middleware);

    friendRouter.get("/", friendController.getAll);
    friendRouter.delete("/remove", friendController.remove);

    return friendRouter;
}
