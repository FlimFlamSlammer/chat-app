import { AuthAccount } from "~/auth/auth-service";

declare global {
    namespace Express {
        interface Request {
            account: AuthAccount;
        }
    }
}
