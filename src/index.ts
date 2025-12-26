import express from "express";
import { ENV } from "./env";
import { errorMiddleware } from "./error";
import mongoose from "mongoose";
import { createAuthRouter } from "./auth/auth-router";
import { Server } from "socket.io";
import { registerSocket } from "./socket/register-socket";
import { createServer } from "http";
import { createFriendRequestRouter } from "./friend-request/friend-request-router";
import { createChatRouter } from "./chat/chat-router";

async function startServer() {
    const app = express();

    mongoose.connect(ENV.MONGO_URI).then(() => console.log("Connected to DB"));

    app.use(express.json());

    app.use("/auth", createAuthRouter());
    app.use("/friend-request", createFriendRequestRouter());
    app.use("/conversation", createChatRouter());

    app.use(errorMiddleware);

    app.listen(ENV.PORT, () => {
        console.log(`Server is running on http://localhost:${ENV.PORT}`);
    });

    const ioServer = createServer();
    const io = new Server(ioServer, {
        cors: {
            credentials: true,
            origin: "http://localhost:3000",
        },
    });
    registerSocket(io);

    ioServer.listen(ENV.SOCKET_PORT, () => {
        console.log(
            `Socket server is running on http://localhost:${ENV.SOCKET_PORT}`
        );
    });
}

startServer().then();
