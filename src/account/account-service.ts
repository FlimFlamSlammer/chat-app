import { StatusCodes } from "http-status-codes";
import { ErrorWithMessage } from "~/error";
import { Account } from "~/models/account";

class AccountService {
    async findByUsername(username: string) {
        const account = await Account.findOne({ username });
        if (!account) {
            throw new ErrorWithMessage(
                StatusCodes.NOT_FOUND,
                "Account not found"
            );
        }
        return account;
    }
}

export const accountService = new AccountService();
