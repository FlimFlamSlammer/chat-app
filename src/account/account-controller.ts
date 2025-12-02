import { StatusCodes } from "http-status-codes";
import z from "zod";
import { asyncMiddleware } from "~/async-middleware";
import { authService } from "~/auth/auth-service";
import { ErrorWithMessage } from "~/error";
import { friendRequestService } from "~/friend-request/friend-request-service";
import { Account } from "~/models/account";
import { objectIdArrayIncludes } from "~/utils/object-id-array-includes";
import { withValidation } from "~/validation";

const getAccountParamsSchema = z.object({
    username: z.string(),
});

class AccountController {
    get = withValidation(
        {
            paramsSchema: getAccountParamsSchema,
        },
        asyncMiddleware(async (req, res, next) => {
            const targetAccount = await Account.findOne({
                username: req.params.username,
            });
            if (!targetAccount) {
                throw new ErrorWithMessage(
                    StatusCodes.NOT_FOUND,
                    "Account with specified username not found"
                );
            }

            const curAccount = await Account.findById(req.body.account.id);
            if (!curAccount) {
                throw new ErrorWithMessage(
                    StatusCodes.NOT_FOUND,
                    "Logged in account not found"
                );
            }
            if (curAccount.friends.includes(targetAccount.id)) {
                res.status(StatusCodes.OK).json({
                    data: {
                        username: targetAccount.username,
                        name: targetAccount.name,
                    },
                });
            } else {
                res.status(StatusCodes.OK).json({
                    data: {
                        username: targetAccount.username,
                    },
                });
            }
        })
    );
}

export const accountController = new AccountController();
