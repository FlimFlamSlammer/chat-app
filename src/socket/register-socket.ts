import { Server, Socket } from "socket.io";
import { authService } from "~/auth/auth-service";
import { registerFriendRequestHandlers } from "./friend-request";

export const registerSocket = (io: Server) => {
    io.on("connection", async (socket: Socket) => {
        try {
            const token = socket.handshake.headers.authorization as string;

            const account = await authService.verifyAuthToken(token);
            socket.data.accountId = account._id;
            socket.join(`personal:${account._id}`);
            console.log(
                `Socket connected: ${socket.id} from account ${account._id}`
            );

            registerFriendRequestHandlers(io, socket);
        } catch (error) {}
    });
};
