import mongoose, { Document, Schema, Types } from "mongoose";

export interface IAccount extends Document {
    name: string;
    username: string;
    friends: Types.ObjectId[];
    conversations: Types.ObjectId[];
    email: string;
    password: string;
    createdAt: Date;
    updatedAt: Date;
}

const accountSchema = new Schema<IAccount>(
    {
        name: {
            type: String,
            required: true,
            index: true,
        },
        username: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
            index: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        password: {
            type: String,
            required: true,
        },
        friends: [
            { type: Schema.Types.ObjectId, required: true, ref: "Account" },
        ],
        conversations: [
            { type: Schema.Types.ObjectId, required: true, ref: "Conversation" },
        ],
    },
    { timestamps: true }
);

export const Account = mongoose.model<IAccount>("Account", accountSchema);
