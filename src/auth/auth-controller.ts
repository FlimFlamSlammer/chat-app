import { asyncMiddleware } from "~/async-middleware";
import { authService } from "./auth-service";
import { withValidation } from "~/validation";
import z from "zod";

const createAccountSchema = z.object({
    name: z.string(),
    username: z.string(),
    email: z.string(),
    password: z.string(),
});

class AuthController {
    register = withValidation(
        {
            bodySchema: createAccountSchema,
        },
        asyncMiddleware(async (req, res) => {
            const account = await authService.register(req.body);
            return res.status(201).json(account);
        })
    );
}
