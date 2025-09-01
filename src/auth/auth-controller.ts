import { asyncMiddleware } from "~/async-middleware";
import { authService } from "./auth-service";
import { withValidation } from "~/validation";
import z from "zod";
import { StatusCodes } from "http-status-codes";

const registerSchema = z.object({
    name: z.string(),
    username: z.string(),
    email: z.string(),
    password: z.string(),
});

const logInSchema = z.object({
    email: z.string(),
    password: z.string(),
});

class AuthController {
    register = withValidation(
        {
            bodySchema: registerSchema,
        },
        asyncMiddleware(async (req, res) => {
            await authService.register(req.body);
            return res.status(StatusCodes.OK).json({
                message: "Account created successfully.",
            });
        })
    );

    logIn = withValidation(
        {
            bodySchema: logInSchema,
        },
        asyncMiddleware(async (req, res) => {
            const account = await authService.logIn(req.body);
            return res.status(200).json({
                message: "Login successful.",
                data: {
                    id: account.id,
                    name: account.name,
                    username: account.username,
                    email: account.email,
                },
            });
        })
    );
}

export const authController = new AuthController();
