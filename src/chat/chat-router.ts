import express from "express"
import { chatController } from "./chat-controller";
import { authController } from "~/auth/auth-controller";

export const createChatRouter = () => {
	const chatRouter = express.Router();

	chatRouter.use(authController.middleware);
	chatRouter.post("/create-personal", chatController.createPersonalConversation);
	chatRouter.post(
        "/:conversationId/send-message",
        chatController.sendMessage
    );
	chatRouter.get("/:conversationId/messages", chatController.getMessages);
	chatRouter.get("/", chatController.getConversations);

	return chatRouter;
}