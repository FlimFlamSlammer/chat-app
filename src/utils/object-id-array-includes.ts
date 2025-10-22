import mongoose from "mongoose";

export const objectIdArrayIncludes = (arr: mongoose.Types.ObjectId[], targetId: string) => {
	return arr.some((id) => (id.toString() === targetId));
}