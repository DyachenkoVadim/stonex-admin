import { mongooseConnect } from "@/lib/mongoose";
import { Order } from "@/models/Order";

export default async function handler(req, res) {
	await mongooseConnect();

	const { method } = req;

	try {
		if (method === "GET") {
			const orders = await Order.find().sort({ createdAt: -1 });
			return res.json(orders);
		}

		if (method === "PATCH") {
			await Order.updateMany(
				{ $or: [{ viewed: false }, { viewed: { $exists: false } }] },
				{ $set: { viewed: true } }
			);
			return res.json({ success: true });
		}

		// Якщо метод не підтримується
		return res.status(405).json({ error: "Method Not Allowed" });
	} catch (error) {
		console.error("API Error:", error);
		return res.status(500).json({ error: "Internal Server Error" });
	}
}
