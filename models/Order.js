const { Schema, model, models } = require("mongoose");

const OrderSchema = new Schema(
	{
		line_items: Object,
		name: String,
		email: String,
		city: String,
		postal: String,
		address: String,
		country: String,
		paid: Boolean,
		viewed: { type: Boolean, default: false },
	},
	{
		timestamps: true,
	}
);

export const Order = models?.Order || model("Order", OrderSchema);
