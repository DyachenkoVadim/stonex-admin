import { mongooseConnect } from "@/lib/mongoose";
import { Order } from "@/models/Order";
import { Review } from "@/models/Review";
import { Product } from "@/models/Product";

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
		monthlyData[key] = { profit: 0, orders: 0 };
	}

	const keys = Object.keys(monthlyData);
	const latestKey = keys.at(-1); // поточний місяць
	const prevKey = keys.at(-2); // попередній місяць

	const productStats = {}; // для останнього місяця
	const prevProductStats = {}; // для попереднього

	for (const order of orders) {
		const date = new Date(order.createdAt);
		const year = date.getFullYear();
		const month = (date.getMonth() + 1).toString().padStart(2, "0");
		const key = `${year}-${month}`;

		const items = Array.isArray(order.line_items)
			? order.line_items
			: Object.values(order.line_items || {});

		let orderTotal = 0;

		for (const item of items) {
			const price = item.price_data?.unit_amount || 0;
			const quantity = item.quantity || 0;
			const itemProfit = (price * quantity) / 100;

			orderTotal += itemProfit;

			const title =
				item.price_data?.product_data?.name || item.product?.title || "Unnamed";

			if (key === latestKey) {
				if (!productStats[title]) {
					productStats[title] = { orders: 0, profit: 0 };
				}
				productStats[title].orders += quantity;
				productStats[title].profit += itemProfit;
			}

			if (key === prevKey) {
				if (!prevProductStats[title]) {
					prevProductStats[title] = { orders: 0, profit: 0 };
				}
				prevProductStats[title].orders += quantity;
				prevProductStats[title].profit += itemProfit;
			}
		}

		if (key in monthlyData) {
			monthlyData[key].profit += orderTotal;
			monthlyData[key].orders++;
		}
	}

	let topProduct = null;

	if (Object.keys(productStats).length > 0) {
		const [title, current] = Object.entries(productStats).reduce((a, b) =>
			a[1].orders > b[1].orders ? a : b
		);

		const previous = prevProductStats[title] || { orders: 0, profit: 0 };

		const orderGrowth = previous.orders
			? ((current.orders - previous.orders) / previous.orders) * 100
			: current.orders > 0
			? 100
			: 0;

		const profitGrowth = previous.profit
			? ((current.profit - previous.profit) / previous.profit) * 100
			: current.profit > 0
			? 100
			: 0;

		topProduct = {
			title,
			orders: current.orders,
			profit: parseFloat(current.profit.toFixed(2)),
			orderGrowth: parseFloat(orderGrowth.toFixed(2)),
			profitGrowth: parseFloat(profitGrowth.toFixed(2)),
		};
	}

	let productDoc, reviews;

	if (topProduct?.title) {
		productDoc = await Product.findOne({ title: topProduct.title });

		if (productDoc) {
			reviews = await Review.find({ product: productDoc._id });

			const ratings = reviews.map((r) => r.rating);
			const ratingsCount = ratings.length;
			const averageRating =
				ratingsCount > 0
					? ratings.reduce((sum, r) => sum + r, 0) / ratingsCount
					: null;
			const maxRating = ratingsCount > 0 ? Math.max(...ratings) : null;
			const maxRatingCount = ratings.filter((r) => r === maxRating).length;

			topProduct = {
				...topProduct,
				averageRating,
				maxRating,
				ratingsCount,
				maxRatingCount,
			};
		}
	}

	res.setHeader("Cache-Control", "no-store");

	console.log("TOP PRODUCT TO SEND:", topProduct);

	res.json({
		monthlyData,
		topProduct,
	});
}
