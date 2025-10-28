import { StatusCodes } from "http-status-codes";
import { ErrorWithMessage } from "~/error";
import { Account } from "~/models/account";
import { Conversation } from "~/models/conversation";
import { Message } from "~/models/message";
import { objectIdArrayIncludes } from "~/utils/object-id-array-includes";

class ChatService {
    async createPersonalConversation(creatorId: string, targetId: string) {
        const creatorAccount = await Account.findById(creatorId);
        if (!creatorAccount) {
            throw new ErrorWithMessage(
                StatusCodes.NOT_FOUND,
                "Account not found"
            );
        }

        const isFriend = creatorAccount.friends.reduce(
            (acc, friendId) => (acc ||= friendId.toString() == targetId),
            false
        );

        if (!isFriend) {
            throw new ErrorWithMessage(
                StatusCodes.NOT_FOUND,
                "Friend not found"
            );
        }

        if (creatorId > targetId) {
            [creatorId, targetId] = [targetId, creatorId];
        }

        const conversation = await Conversation.create({
            type: "personal",
            participants: [creatorId, targetId],
            dmKey: creatorId + targetId,
        });creatorId

        await Account.findByIdAndUpdate(creatorId, {
            $push: { conversations: conversation._id },
        });
        await Account.findByIdAndUpdate(targetId, {
            $push: { conversations: conversation._id },
        });

        return conversation;
    }

    async sendMessage(conversationId: string, senderId: string, text: string) {
        const conversation = await Conversation.findById(conversationId);
        if (!conversation || !objectIdArrayIncludes(conversation.participants, senderId)) {
            throw new ErrorWithMessage(
                StatusCodes.NOT_FOUND,
                "Conversation not found"
            );
        }
        return await Message.create({
            conversation: conversationId,
            sender: senderId,
            text: text,
        });
    }

    async getConversations(accountId: string) {
        const account = await Account.findById(accountId);
        if (!account) {
            throw new ErrorWithMessage(StatusCodes.NOT_FOUND, "Account not found");
        }

        return account.conversations;
    }

    async getMessages(accountId: string, conversationId: string) {
        const conversation = await Conversation.findById(conversationId);
        if (!conversation || !objectIdArrayIncludes(conversation.participants, accountId)) {
            throw new ErrorWithMessage(StatusCodes.NOT_FOUND, "Conversation not found");
        }

        return await Message.find({ conversation: conversationId }).sort({
            createdAt: -1,
        });
    }
}

export const chatService = new ChatService();
