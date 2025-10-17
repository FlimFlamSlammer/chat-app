import { Conversation } from "~/models/conversation";
import { Message } from "~/models/message";

class ChatService {
    async createPersonalConversation(id1: string, id2: string) {
        if (id1 > id2) {
            [id1, id2] = [id2, id1];
        }

        return await Conversation.create({
            type: "personal",
            participants: [id1, id2],
            dmKey: id1 + id2,
        });
    }

    async sendMessage(conversationId: string, senderId: string, text: string) {
        return await Message.create({
            conversation: conversationId,
            sender: senderId,
            text: text,
        });
    }

    async getMessages(conversationId: string) {
        return await Message.find({ conversation: conversationId }).sort({
            createdAt: -1,
        });
    }
}
