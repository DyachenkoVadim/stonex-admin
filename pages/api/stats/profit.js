import { mongooseConnect } from "@/lib/mongoose";
import { Order } from "@/models/Order";

export default async function handler(req, res) {
	await mongooseConnect();
	const orders = await Order.find({ paid: true }).sort({ createdAt: 1 });

	const now = new Date();
	const monthlyData = {};

	for (let i = 11; i >= 0; i--) {
		const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
		const year = date.getFullYear();
		const month = (date.getMonth() + 1).toString().padStart(2, "0");
		const key = `${year}-${month}`;
		monthlyData[key] = 0;
	}

	for (const order of orders) {
		const date = new Date(order.createdAt);
		const year = date.getFullYear();
		const month = (date.getMonth() + 1).toString().padStart(2, "0");
		const key = `${year}-${month}`;

		if (key in monthlyData) {
			const items = Array.isArray(order.line_items)
				? order.line_items
				: Object.values(order.line_items || {});
			let orderTotal = 0;

			for (const item of items) {
				const price = item.price_data?.unit_amount || 0;
				const quantity = item.quantity || 0;
				orderTotal += (price * quantity) / 100;
			}

			monthlyData[key] += orderTotal;
		}
	}

	res.json(monthlyData);
}
