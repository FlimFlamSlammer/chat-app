import z from "zod";
import { asyncMiddleware } from "~/async-middleware";
import { withValidation } from "~/validation";
import { chatService } from "./chat-service";
import { StatusCodes } from "http-status-codes";

const createPersonalConversationBodySchema = z.object({
    targetUserId: z.string(),
});

const sendMessageParamsSchema = z.object({
	conversationId: z.string(),
})

const sendMessageBodySchema = z.object({
    text: z.string().min(1),
});

const getMessagesParamsSchema = z.object({
    conversationId: z.string(),
});

class ChatController {
    sendMessage = withValidation(
        {
			paramsSchema: sendMessageParamsSchema,
            bodySchema: sendMessageBodySchema,
        },
        asyncMiddleware(async (req, res) => {
			const { conversationId } = req.params as { conversationId: string };
            const { text } = req.body;
            await chatService.sendMessage(conversationId, req.account.id, text);

            res.status(StatusCodes.OK).json({
                message: "Message sent successfully",
            });
        })
    );

    createPersonalConversation = withValidation(
        {
            bodySchema: createPersonalConversationBodySchema,
        },
        asyncMiddleware(async (req, res) => {
            const { targetId } = req.body;
            await chatService.createPersonalConversation(
                req.account.id,
                targetId
            );

            res.status(StatusCodes.OK).json({
                message: "Conversation created successfully",
            });
        })
    );

    getMessages = withValidation(
        {
            paramsSchema: getMessagesParamsSchema,
        },
        asyncMiddleware((req, res) => {
            const { conversationId } = req.params as { conversationId: string };
            const messages = chatService.getMessages(req.account.id, conversationId);

            res.status(StatusCodes.OK).json({
                data: {
                    messages,
                },
            });
        })
    );

    getConversations = asyncMiddleware(async (req, res) => {
        const conversations = await chatService.getConversations(req.account.id);
        res.status(StatusCodes.OK).json({
            data: {
                conversations,
            },
        });
    });
}

export const chatController = new ChatController();
