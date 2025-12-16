import z from "zod";
import { asyncMiddleware } from "~/async-middleware";
import { withValidation } from "~/validation";
import { chatService } from "./chat-service";
import { StatusCodes } from "http-status-codes";
import { ErrorWithMessage } from "~/error";

const createPersonalConversationBodySchema = z.object({
    targetId: z.string(),
});

const createGroupBodySchema = z.object({
    name: z.string().trim(),
});

const inviteToGroupBodySchema = z.object({
    inviteeIds: z.array(z.string()),
});
const inviteToGroupParamsSchema = z.object({
    groupId: z.string(),
});

const sendMessageParamsSchema = z.object({
    conversationId: z.string(),
});

const sendMessageBodySchema = z.object({
    text: z.string().min(1),
});

const getMessagesParamsSchema = z.object({
    conversationId: z.string(),
});

const idParamsSchema = z.object({
    id: z.string(),
});

const removeParticipantsBodySchema = z.object({
    participantIds: z.array(z.string()),
});

const addAdminsBodySchema = z.object({
    participantIds: z.array(z.string()),
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
            await chatService.sendMessage(
                conversationId,
                req.account._id,
                text
            );

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
                req.account._id,
                targetId
            );

            res.status(StatusCodes.OK).json({
                message: "Conversation created successfully",
            });
        })
    );

    createGroup = withValidation(
        {
            bodySchema: createGroupBodySchema,
        },
        asyncMiddleware(async (req, res) => {
            const { name } = req.body;
            await chatService.createGroup(req.account._id, name);

            res.status(StatusCodes.OK).json({
                message: "Group created successfully",
            });
        })
    );

    inviteToGroup = withValidation(
        {
            paramsSchema: inviteToGroupParamsSchema,
            bodySchema: inviteToGroupBodySchema,
        },
        asyncMiddleware(async (req, res) => {
            const { inviteeIds } = req.body;
            const { groupId } = req.params as { groupId: string };
            await chatService.inviteToGroup(
                req.body.account.id,
                groupId,
                inviteeIds
            );

            res.status(StatusCodes.OK).json({
                message: "User invited successfully",
            });
        })
    );

    getMessages = withValidation(
        {
            paramsSchema: getMessagesParamsSchema,
        },
        asyncMiddleware((req, res) => {
            const { conversationId } = req.params as { conversationId: string };
            const messages = chatService.getMessages(
                req.account._id,
                conversationId
            );

            res.status(StatusCodes.OK).json({
                data: {
                    messages,
                },
            });
        })
    );

    getConversations = asyncMiddleware(async (req, res) => {
        const conversations = await chatService.getConversations(
            req.account._id
        );
        res.status(StatusCodes.OK).json({
            data: conversations,
        });
    });

    getById = withValidation(
        {
            paramsSchema: idParamsSchema,
        },
        asyncMiddleware(async (req, res, next) => {
            const { id } = req.params as { id: string };
            const conversation = await chatService.getById(id);

            res.status(StatusCodes.OK).json({
                data: conversation,
            });
        })
    );

    exit = withValidation(
        {
            paramsSchema: idParamsSchema,
        },
        asyncMiddleware(async (req, res, next) => {
            const { id } = req.params as { id: string };
            await chatService.removeParticipants(id, [req.account._id]);

            res.status(StatusCodes.OK).json({
                message: "Successfully exited group",
            });
        })
    );

    removeParticipants = withValidation(
        {
            paramsSchema: idParamsSchema,
            bodySchema: removeParticipantsBodySchema,
        },
        asyncMiddleware(async (req, res, next) => {
            const { id } = req.params as { id: string };
            const isAdmin = await chatService.isAdmin(id, req.account._id);
            if (isAdmin) {
                await chatService.removeParticipants(
                    id,
                    req.body.participantIds
                );

                res.status(StatusCodes.OK).json({
                    message: "Participants removed successfully",
                });
            } else {
                throw new ErrorWithMessage(
                    StatusCodes.FORBIDDEN,
                    "Only admins can remove participants"
                );
            }
        })
    );

    addAdmins = withValidation(
        {
            paramsSchema: idParamsSchema,
            bodySchema: addAdminsBodySchema,
        },
        asyncMiddleware(async (req, res, next) => {
            const { id } = req.params as { id: string };
            const isAdmin = await chatService.isAdmin(id, req.account._id);
            if (isAdmin) {
                await chatService.addAdmins(id, req.body.participantIds);

                res.status(StatusCodes.OK).json({
                    message: "Admins added successfully",
                });
            } else {
                throw new ErrorWithMessage(
                    StatusCodes.FORBIDDEN,
                    "Only admins can add new admins"
                );
            }
        })
    );
}

export const chatController = new ChatController();
