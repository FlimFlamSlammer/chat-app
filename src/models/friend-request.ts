import mongoose, { Schema, Types } from "mongoose";

export interface IFriendRequest extends Document {
    from: Types.ObjectId;
    to: Types.ObjectId;
    status: string;
    createdAt: Date;
    updatedAt: Date;
}

const friendRequestSchema = new Schema<IFriendRequest>(
    {
        from: { type: Schema.Types.ObjectId, ref: "Account", required: true },
        to: { type: Schema.Types.ObjectId, ref: "Account", required: true },
        status: { type: String },
    },
    {
        timestamps: true,
    }
);

friendRequestSchema.index({ from: 1, to: 1 }, { unique: true });

export const FriendRequest = mongoose.model<IFriendRequest>(
    "FriendRequest",
    friendRequestSchema
);
