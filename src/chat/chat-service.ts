import { StatusCodes } from "http-status-codes";
import mongoose from "mongoose";
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
            (acc, friendId) => (acc ||= friendId.toString() === targetId),
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
        });

        await Account.findByIdAndUpdate(creatorId, {
            $addToSet: { conversations: conversation._id },
        });
        await Account.findByIdAndUpdate(targetId, {
            $addToSet: { conversations: conversation._id },
        });

        return conversation;
    }

    async createGroup(creatorId: string, name: string) {
        const creatorAccount = await Account.findById(creatorId);
        if (!creatorAccount) {
            throw new ErrorWithMessage(
                StatusCodes.NOT_FOUND,
                "Account not found"
            );
        }

        const conversation = await Conversation.create({
            name,
            type: "group",
            participants: [creatorId],
            admins: [creatorId],
            createdBy: creatorId,
        });

        await Account.findByIdAndUpdate(creatorId, {
            $push: { conversations: conversation._id },
        });

        return conversation;
    }

    async inviteToGroup(
        inviterId: string,
        groupId: string,
        inviteeIds: string[]
    ) {
        const inviterAccount = await Account.findById(inviterId);
        if (!inviterAccount) {
            throw new ErrorWithMessage(
                StatusCodes.NOT_FOUND,
                "Inviter account not found"
            );
        }

        const group = await Conversation.findById(groupId);
        if (!group || group.type != "group") {
            throw new ErrorWithMessage(
                StatusCodes.NOT_FOUND,
                "Group not found"
            );
        }
        if (!objectIdArrayIncludes(group.admins, inviterId)) {
            throw new ErrorWithMessage(
                StatusCodes.FORBIDDEN,
                "Inviter is not an admin"
            );
        }

        const invitees = await Account.find()
            .where("_id")
            .in(inviteeIds.map((id) => new mongoose.Types.ObjectId(id)))
            .where("_id")
            .in(inviterAccount.friends);

        if (invitees.length != inviteeIds.length) {
            throw new ErrorWithMessage(
                StatusCodes.NOT_FOUND,
                "Invitee(s) not found"
            );
        }

        await group.updateOne({
            $addToSet: { participants: { $each: inviteeIds } },
        });

        await Account.updateMany(
            {
                _id: {
                    $in: inviteeIds,
                },
            },
            {
                $addToSet: {
                    conversations: groupId,
                },
            }
        );
    }

    async sendMessage(conversationId: string, senderId: string, text: string) {
        const conversation = await Conversation.findById(conversationId);
        if (
            !conversation ||
            !objectIdArrayIncludes(conversation.participants, senderId)
        ) {
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
        const account = await Account.findById(accountId).populate({
            path: "conversations",
            select: "name type participants",
            populate: {
                path: "participants",
                select: "username",
                perDocumentLimit: 2,
            },
        });
        if (!account) {
            throw new ErrorWithMessage(
                StatusCodes.NOT_FOUND,
                "Account not found"
            );
        }

        return account.conversations;
    }

    async getMessages(accountId: string, conversationId: string) {
        const conversation = await Conversation.findById(conversationId);
        if (
            !conversation ||
            !objectIdArrayIncludes(conversation.participants, accountId)
        ) {
            throw new ErrorWithMessage(
                StatusCodes.NOT_FOUND,
                "Conversation not found"
            );
        }

        return await Message.find({ conversation: conversationId }).sort({
            createdAt: -1,
        });
    }

    async getById(id: string) {
        const conversation = await Conversation.findById(id)
            .populate({
                path: "participants",
                select: "username _id",
            })
            .populate({
                path: "admins",
                select: "username _id",
            });
        return conversation;
    }

    async addAdmins(conversationId: string, participantIds: string[]) {
        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
            throw new ErrorWithMessage(
                StatusCodes.NOT_FOUND,
                "Conversation not found"
            );
        }
        const participants = await Account.find()
            .where("_id")
            .in(participantIds.map((id) => new mongoose.Types.ObjectId(id)))
            .where("conversations")
            .elemMatch({ _id: conversationId });

        if (participants.length != participantIds.length) {
            throw new ErrorWithMessage(
                StatusCodes.NOT_FOUND,
                "Participant(s) not found"
            );
        }

        await conversation.updateOne({
            $addToSet: {
                admins: {
                    _id: {
                        $in: participantIds,
                    },
                },
            },
        });
    }

    async isAdmin(conversationId: string, participantId: string) {
        const conversation = await Conversation.find({
            _id: conversationId,
            admins: {
                $elemMatch: {
                    _id: participantId,
                },
            },
        });

        if (conversation) {
            return true;
        } else {
            return false;
        }
    }

    async removeParticipants(conversationId: string, participantIds: string[]) {
        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
            throw new ErrorWithMessage(
                StatusCodes.NOT_FOUND,
                "Conversation not found"
            );
        }
        const participants = await Account.find()
            .where("_id")
            .in(participantIds.map((id) => new mongoose.Types.ObjectId(id)));

        if (participants.length != participantIds.length) {
            throw new ErrorWithMessage(
                StatusCodes.NOT_FOUND,
                "Participant account(s) not found"
            );
        }

        participants.forEach((participant) => {
            if (conversation.createdBy == participant.id) {
                throw new ErrorWithMessage(
                    StatusCodes.NOT_FOUND,
                    "Cannot remove creator from group"
                );
            }
        });

        await conversation.updateOne({
            $pull: {
                participants: {
                    _id: {
                        $in: participantIds,
                    },
                },
            },
        });

        await Account.updateMany(
            {
                _id: {
                    $in: participantIds,
                },
            },
            {
                $pull: {
                    conversations: {
                        _id: conversationId,
                    },
                },
            }
        );
    }
}

export const chatService = new ChatService();
