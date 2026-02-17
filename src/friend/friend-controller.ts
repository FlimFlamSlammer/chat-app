import { asyncMiddleware } from "~/async-middleware";
import { friendService } from "./friend-service";
import { StatusCodes } from "http-status-codes";
import z from "zod";
import { withValidation } from "~/validation";

const removeFriendBodySchema = z.object({
    friendId: z.string(),
});

class FriendController {
    getAll = asyncMiddleware(async (req, res, next) => {
        const friends = await friendService.getAll(req.account._id);
        res.status(StatusCodes.OK).json({
            data: friends,
        });
    });

    remove = withValidation(
        {
            bodySchema: removeFriendBodySchema,
        },
        asyncMiddleware(async (req, res, next) => {
            await friendService.remove(req.account._id, req.body.friendId);
            res.status(StatusCodes.OK).json({
                message: "Friend successfully removed",
            });
        })
    );
}

export const friendController = new FriendController();
