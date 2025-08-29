import "express";

declare module "express-serve-static-core" {
    interface Request {
        account: {
            id: string;
            name: string;
            username: string;
            email: string;
        };
    }
}
