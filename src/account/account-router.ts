import express from "express";
import { accountController } from "./account-controller";

export const createAccountRouter = () => {
    const accountRouter = express.Router();

    accountRouter.get("/find/:username", accountController.get);

    return accountRouter;
};
