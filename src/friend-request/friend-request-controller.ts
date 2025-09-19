import z from "zod";
import { asyncMiddleware } from "~/async-middleware";
import { withValidation } from "~/validation";
import { friendRequestService } from "./friend-request-service";
import { StatusCodes } from "http-status-codes";

const sendFriendRequestSchema = z.object({
    to: z.string(),
});

const acceptFriendRequestSchema = z.object({
    id: z.string(),
});

class FriendRequestController {
    send = withValidation(
        {
            querySchema: sendFriendRequestSchema,
        },
        asyncMiddleware(async (req, res) => {
            const to = req.query.to as string;
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
            querySchema: acceptFriendRequestSchema,
        },
        asyncMiddleware(async (req, res) => {
            const id = req.query.id as string;
            await friendRequestService.accept(id);

            res.status(StatusCodes.OK).json({
                message: "Friend request accepted successfully",
            });
        })
    );
}

export const friendRequestController = new FriendRequestController();
