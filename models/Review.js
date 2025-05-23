import { model, models, Schema } from "mongoose";

const ReviewSchema = new Schema(
	{
		product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
		user: { type: String, required: false },
		rating: { type: Number, required: true, min: 1, max: 5 },
		comment: { type: String, required: true },
	},
	{ timestamps: true }
);

export const Review = models?.Review || model("Review", ReviewSchema);
