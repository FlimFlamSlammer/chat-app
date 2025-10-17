import mongoose, { Schema, Types } from "mongoose";

export interface IConversation extends Document {
    name: string;
    type: string;
    participants: Types.ObjectId[];
    admins: Types.ObjectId[];
    createdBy: Types.ObjectId;
    dmKey: string | null;
    createdAt: Date;
    updatedAt: Date;
}

const conversationSchema = new Schema<IConversation>(
    {
        name: { type: String },
        type: { type: String, required: true }, // personal | group
        participants: [
            {
                type: Schema.Types.ObjectId,
                ref: "Account",
                required: true,
                default: [],
            },
        ],
        admins: [
            {
                type: Schema.Types.ObjectId,
                ref: "Account",
                required: true,
                default: [],
            },
        ],
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: "Account",
        },
        dmKey: { type: String, index: { unique: true, sparse: true } },
    },
    { timestamps: true }
);

export const Conversation = mongoose.model<IConversation>(
    "Conversation",
    conversationSchema
);
