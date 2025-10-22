import z from "zod";
import { asyncMiddleware } from "~/async-middleware";
import { withValidation } from "~/validation";
import { friendRequestService } from "./friend-request-service";
import { StatusCodes } from "http-status-codes";
import { FriendRequest } from "~/models/friend-request";
import { accountService } from "~/account/account-service";

const sendFriendRequestBodySchema = z.object({
    username: z.string().trim(),
});

const acceptFriendRequestParamsSchema = z.object({
    id: z.string(),
});

class FriendRequestController {
    send = withValidation(
        {
            bodySchema: sendFriendRequestBodySchema,
        },
        asyncMiddleware(async (req, res) => {
            const { username } = req.body;
            const account = await accountService.findByUsername(username);

            await friendRequestService.send({
                from: req.account.id,
                to: account?.id,
            });

            res.status(StatusCodes.OK).json({
                message: "Friend request sent successfully",
            });
        })
    );

    accept = withValidation(
        {
            paramsSchema: acceptFriendRequestParamsSchema,
        },
        asyncMiddleware(async (req, res) => {
            const id = req.params.id as string;

            await friendRequestService.accept(id, req.account.id);

            res.status(StatusCodes.OK).json({
                message: "Friend request accepted successfully",
            });
        })
    );

    reject = withValidation(
        {
            paramsSchema: acceptFriendRequestParamsSchema,
        },
        asyncMiddleware(async (req, res) => {
            const id = req.params.id as string;

            await friendRequestService.reject(id, req.account.id);

            res.status(StatusCodes.OK).json({
                message: "Friend request rejected successfully",
            });
        })
    );

    getIncoming = asyncMiddleware(async (req, res) => {
        const friendRequests = await FriendRequest.find({
            to: req.account.id,
        });
        res.status(StatusCodes.OK).json({
            data: friendRequests,
        });
    });

    getOutgoing = asyncMiddleware(async (req, res) => {
        const friendRequests = await FriendRequest.find({
            from: req.account.id,
        });
        res.status(StatusCodes.OK).json({
            data: friendRequests,
        });
    });
}

export const friendRequestController = new FriendRequestController();
