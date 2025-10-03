import express from "express";
import { authController } from "./auth-controller";

export const createAuthRouter = () => {
    const authRouter = express.Router();

    authRouter.post("/login", authController.logIn);
    authRouter.post("/register", authController.register);
    authRouter.get(
        "/me",
        authController.middleware,
        authController.getLoggedInAccount
    );

    return authRouter;
};
