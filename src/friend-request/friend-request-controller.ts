import z from "zod";
import { asyncMiddleware } from "~/async-middleware";
import { withValidation } from "~/validation";
import { friendRequestService } from "./friend-request-service";
import { StatusCodes } from "http-status-codes";
import { FriendRequest } from "~/models/friend-request";
import { ErrorWithMessage } from "~/error";

const sendFriendRequestSchema = z.object({
    to: z.string(),
});

const acceptFriendRequestSchema = z.object({
    id: z.string(),
});

class FriendRequestController {
    send = withValidation(
        {
            paramsSchema: sendFriendRequestSchema,
        },
        asyncMiddleware(async (req, res) => {
            const { to } = req.params as { to: string };
            await friendRequestService.send({
                from: req.account.id,
                to,
            });

            res.status(StatusCodes.OK).json({
                message: "Friend request sent successfully",
            });
        })
    );

    accept = withValidation(
        {
            paramsSchema: acceptFriendRequestSchema,
        },
        asyncMiddleware(async (req, res) => {
            const id = req.params.id as string;

            await friendRequestService.accept(id, req.account.id);

            res.status(StatusCodes.OK).json({
                message: "Friend request accepted successfully",
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
