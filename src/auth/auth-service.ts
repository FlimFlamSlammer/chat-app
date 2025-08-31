import { Account } from "~/models/account";
import argon2 from "argon2";
import { FieldError } from "~/error";

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

class AuthService {
    async register(data: CreateAccountDTO) {
        const passwordHash = await argon2.hash(data.password);
        return await Account.create({ ...data, password: passwordHash });
    }

    async logIn(data: LogInDTO) {
        const account = await Account.findOne({ email: data.email });
        const invalidCredentials = () =>
            new FieldError({
                email: "Invalid credentials.",
                password: "Invalid credentials.",
            });
        if (!account) throw invalidCredentials();

        const isValid = await argon2.verify(account.password, data.password);
        if (!isValid) throw invalidCredentials();

        return account;
    }
}

export const authService = new AuthService();
