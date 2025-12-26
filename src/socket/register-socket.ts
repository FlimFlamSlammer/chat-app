import { Server, Socket } from "socket.io";
import { authService } from "~/auth/auth-service";
import { registerFriendRequestHandlers } from "./friend-request";
import * as cookie from "cookie";
import { ErrorWithMessage } from "~/error";
import { StatusCodes } from "http-status-codes";

export const registerSocket = (io: Server) => {
    io.on("connection", async (socket: Socket) => {
        try {
            const cookies = cookie.parse(socket.handshake.headers.cookie || "");

            const token = cookies.authToken;
            if (!token) {
                throw new ErrorWithMessage(
                    StatusCodes.UNAUTHORIZED,
                    "Unauthorized!"
                );
            }

            const account = await authService.verifyAuthToken(token);
            socket.data.accountId = account.id;
            socket.join(`personal:${account.id}`);
            console.log(
                `Socket connected: ${socket.id} from account ${account.id}`
            );

            registerFriendRequestHandlers(io, socket);
        } catch (error) {
            console.log(error);
            socket.disconnect(true);
        }
    });
};
