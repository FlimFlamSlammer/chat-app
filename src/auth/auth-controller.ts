import { asyncMiddleware } from "~/async-middleware";
import { authService } from "./auth-service";
import { withValidation } from "~/validation";
import z from "zod";
import jwt from "jsonwebtoken";

import { StatusCodes } from "http-status-codes";
import { ENV } from "~/env";

const registerSchema = z.object({
    name: z.string().trim().min(1, "Required"),
    username: z.string().trim().min(1, "Required"),
    email: z.string().trim().min(1, "Required"),
    password: z.string().min(1, "Required"),
});

const logInSchema = z.object({
    email: z.string().trim().min(1, "Required"),
    password: z.string().min(1, "Required"),
});

class AuthController {
    register = withValidation(
        {
            bodySchema: registerSchema,
        },
        asyncMiddleware(async (req, res) => {
            await authService.register(req.body);
            return res.status(StatusCodes.OK).json({
                message: "Account created successfully",
            });
        })
    );

    logIn = withValidation(
        {
            bodySchema: logInSchema,
        },
        asyncMiddleware(async (req, res) => {
            const { authToken, account } = await authService.logIn(req.body);

            return res.status(200).json({
                message: "Login successful",
                data: {
                    authToken,
                    account,
                },
            });
        })
    );

    // returns the logged-in account using the AuthAccount type
    getLoggedInAccount = asyncMiddleware(async (req, res) => {
        return res.status(StatusCodes.OK).json({
            message: "Account details",
            data: { ...req.account, password: undefined },
        });
    });

    middleware = asyncMiddleware(async (req, res, next) => {
        const bearerToken = req.headers.authorization;
        const unauthorizedResponse = () => {
            return res.status(StatusCodes.UNAUTHORIZED).json({
                message: "Unauthorized",
            });
        };
        if (!bearerToken) {
            return unauthorizedResponse();
        }

        try {
            const [_, authToken] = bearerToken.split(" ");
            const account = await authService.verifyAuthToken(authToken);
            req.account = account;
            next();
        } catch (error) {
            return unauthorizedResponse();
        }
    });
}

export const authController = new AuthController();
