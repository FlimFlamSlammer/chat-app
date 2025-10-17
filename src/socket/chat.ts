import { StatusCodes } from "http-status-codes";
import { Server, Socket } from "socket.io";
import { ErrorWithMessage } from "~/error";
import { Message } from "~/models/message";

export const registerChatHandlers = (io: Server, socket: Socket) => {
	socket.on("message:send", async (messageId: string) => {
		try {
			const message = await Message.findById(messageId);
			if (!message || message.sender !== socket.data.accountId) {
				throw new ErrorWithMessage(
					StatusCodes.NOT_FOUND,
					"Message not found"
				);
			}

			io.to(`personal:${message.conversation}`).emit(
				"message:received",
				message
			);

			socket.emit("message:received:ack", message);
		} catch {
			socket.emit("error", "Failed to send message");
		}
	})

};