import mongoose, { Schema, Types } from "mongoose";

export interface IMessage extends Document {
    conversation: Types.ObjectId;
    sender: Types.ObjectId;
    text: string;
    createdAt: Date;
    updatedAt: Date;
}

const messageSchema = new Schema<IMessage>(
    {
        conversation: {
            type: Schema.Types.ObjectId,
            ref: "Conversation",
            required: true,
            index: true,
        },
        sender: { type: Schema.Types.ObjectId, ref: "Account", required: true },
        text: { type: String, required: true },
    },
    { timestamps: true }
);

export const Message = mongoose.model<IMessage>("Message", messageSchema);
