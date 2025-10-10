import { StatusCodes } from "http-status-codes";
import mongoose from "mongoose";
import { ErrorWithMessage } from "~/error";
import { Account } from "~/models/account";
import { FriendRequest } from "~/models/friend-request";

export interface SendFriendRequestDTO {
    from: string;
    to: string;
}

class FriendRequestService {
    async send(data: SendFriendRequestDTO) {
        const sender = await Account.findById(data.from);
        const alreadyFriends = sender?.friends.reduce(
            (acc, friendId) => (acc ||= friendId.toString() == data.to),
            false
        );
        if (alreadyFriends) {
            throw new ErrorWithMessage(
                StatusCodes.BAD_REQUEST,
                "Already friends with receiver"
            );
        }

        return await FriendRequest.create({
            ...data,
        });
    }

    async accept(id: string, receiverId: string) {
        const request = await FriendRequest.findById(id);
        if (!request || request.to.toString() !== receiverId) {
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

        await FriendRequest.deleteOne({ _id: id });
        await FriendRequest.deleteOne({
            from: request.to,
            to: request.from,
        });
    }

    async reject(id: string, receiverId: string) {
        const request = await FriendRequest.findById(id);
        if (!request || request.to.toString() !== receiverId) {
            throw new ErrorWithMessage(
                StatusCodes.NOT_FOUND,
                "Friend request not found"
            );
        }

        await FriendRequest.deleteOne({ _id: id });
    }
}

export const friendRequestService = new FriendRequestService();
