import express from "express";
import { authController } from "./auth-controller";

export const createAuthRouter = () => {
    const authRouter = express.Router();

    authRouter.use(authController.middleware);

    authRouter.post("/login", authController.logIn);
    authRouter.post("/register", authController.register);
    authRouter.post("/me", authController.getLoggedInAccount);

    return authRouter;
};
