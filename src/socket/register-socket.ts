import { Server, Socket } from "socket.io";
import { authService } from "~/auth/auth-service";
import { registerFriendRequestHandlers } from "./friend-request";
import * as cookie from "cookie";

export const registerSocket = (io: Server) => {
    io.on("connection", async (socket: Socket) => {
        try {
            const cookies = cookie.parse(socket.handshake.headers.cookie || "");
            console.log(cookies);
            const token = cookies.AUTH_TOKEN;

            if (!token) {
                throw new Error("Fail to authenticate!");
            }

            const account = await authService.verifyAuthToken(token);
            socket.data.accountId = account._id;
            socket.join(`personal:${account._id}`);
            console.log(
                `Socket connected: ${socket.id} from account ${account._id}`
            );

            registerFriendRequestHandlers(io, socket);
        } catch (error) {
            console.error(error);
            socket.disconnect();
        }
    });
};
