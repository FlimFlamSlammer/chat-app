import { Account } from "~/models/account";
import argon2 from "argon2";
import { FieldError } from "~/error";
import jwt from "jsonwebtoken";
import { ENV } from "~/env";

export interface CreateAccountDTO {
    name: string;
    username: string;
    email: string;
    password: string;
}

export interface LogInDTO {
    email: string;
    password: string;
}

export interface AuthAccount {
    id: string;
    name: string;
    username: string;
    email: string;
}

interface AuthTokenPayload {
    id: string;
}

class AuthService {
    async register(data: CreateAccountDTO) {
        const passwordHash = await argon2.hash(data.password);
        return await Account.create({ ...data, password: passwordHash });
    }

    async logIn(data: LogInDTO) {
        const account = await Account.findOne({ email: data.email });
        const invalidCredentials = () =>
            new FieldError({
                email: "Invalid credentials",
                password: "Invalid credentials",
            });
        if (!account) throw invalidCredentials();

        const isValid = await argon2.verify(account.password, data.password);
        if (!isValid) throw invalidCredentials();

        const authToken = this.signAuthToken({ id: account.id });

        return authToken;
    }

    async verifyAuthToken(rawAuthToken: string) {
        // split bearer and token
        const [_, authToken] = rawAuthToken.split(" ");

        const { id } = jwt.verify(authToken, ENV.JWT_SECRET) as { id: string };
        return (await Account.findById(id)) as AuthAccount;
    }

    private signAuthToken(payload: AuthTokenPayload) {
        return jwt.sign(payload, ENV.JWT_SECRET, {
            expiresIn: "1 week",
        });
    }
}

export const authService = new AuthService();
