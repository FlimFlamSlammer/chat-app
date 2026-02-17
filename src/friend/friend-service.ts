import { StatusCodes } from "http-status-codes";
import { ErrorWithMessage } from "~/error";
import { Account } from "~/models/account";

class FriendService {
    async getAll(accountId: string) {
        const account = await Account.findById(accountId).populate({
            path: "friends",
            select: "name username",
        });
        if (!account) {
            throw new ErrorWithMessage(
                StatusCodes.NOT_FOUND,
                "Account not found"
            );
        }

        return account.friends;
    }

    async remove(id1: string, id2: string) {
        const account1 = await Account.findById(id1);
        const account2 = await Account.findById(id2);

        if (!account1 || !account2) {
            throw new ErrorWithMessage(
                StatusCodes.NOT_FOUND,
                "Account(s) not found"
            );
        }

        account1.updateOne({
            friends: {
                $pull: {
                    _id: id2,
                },
            },
        });

        account2.updateOne({
            friends: {
                $pull: {
                    _id: id1,
                },
            },
        });
    }
}

export const friendService = new FriendService();
