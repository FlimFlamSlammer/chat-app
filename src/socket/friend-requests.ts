import { StatusCodes } from "http-status-codes";
import { Server, Socket } from "socket.io";
import { ErrorWithMessage } from "~/error";
import { FriendRequest } from "~/models/friend-request";

export const registerFriendRequestHandlers = (io: Server, socket: Socket) => {
    socket.on("friend-request:send", async (requestId: string) => {
        try {
            const request = await FriendRequest.findById(requestId);
            if (!request) {
                throw new ErrorWithMessage(
                    StatusCodes.NOT_FOUND,
                    "Friend request not found"
                );
            }

            io.to(`personal:${request.to}`).emit(
                "friend-request:received",
                request
            );

            socket.emit("friend-request:sent", request);
        } catch (error) {}
    });
};
