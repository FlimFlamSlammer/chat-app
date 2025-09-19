import { StatusCodes } from "http-status-codes";
import { ErrorWithMessage } from "~/error";
import { Account } from "~/models/account";
import { FriendRequest } from "~/models/friend-request";

export interface SendFriendRequestDTO {
    from: string;
    to: string;
}

class FriendRequestService {
    async send(data: SendFriendRequestDTO) {
        return await FriendRequest.create({
            ...data,
        });
    }

    async accept(id: string) {
        const request = await FriendRequest.findById(id);
        if (!request) {
            throw new ErrorWithMessage(
                StatusCodes.NOT_FOUND,
                "Friend request not found"
            );
        }

        await Account.findByIdAndUpdate(request.from, {
            $push: { friends: request.to },
        });
        await Account.findByIdAndUpdate(request.to, {
            $push: { friends: request.from },
        });
    }
}

export const friendRequestService = new FriendRequestService();
