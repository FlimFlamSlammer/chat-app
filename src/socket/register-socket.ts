import { Server, Socket } from "socket.io";
import { authService } from "~/auth/auth-service";
import { registerFriendRequestHandlers } from "./friend-requests";

export const registerSocket = (io: Server) => {
    io.on("connection", async (socket: Socket) => {
        try {
            const rawToken = socket.handshake.headers.authorization as string;

            const account = await authService.verifyAuthToken(token);
            socket.data.accountId = account.id;
            socket.join(`personal:${account.id}`);
            console.log(
                `Socket connected: ${socket.id} from account ${account.id}`
            );

            registerFriendRequestHandlers(io, socket);
        } catch (error) {}
    });
};
