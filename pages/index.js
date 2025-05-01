import Layout from "@/components/Layout";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import axios from "axios";
import StatsCard from "@/components/StatsCard";
import ProfitChart from "@/components/ProfitChart";

export default function Home() {
	const { data: session } = useSession();
	const [stats, setStats] = useState({
		newOrders: 0,
		lastEditedProduct: "—",
		totalProducts: 0,
	});

	useEffect(() => {
		async function fetchStats() {
			try {
				const [productsRes, ordersRes] = await Promise.all([
					axios.get("/api/products"),
					axios.get("/api/orders"),
				]);

				const products = productsRes.data;
				const orders = ordersRes.data;

				const newOrders = orders.filter((order) => !order.viewed);

				const sortedProducts = [...products].sort(
					(a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
				);

				setStats({
					newOrders: newOrders.length,
					lastEditedProduct: sortedProducts[0]?.title || "—",
					totalProducts: products.length,
				});
			} catch (error) {
				console.error("Failed to load dashboard stats", error);
			}
		}

		fetchStats();
	}, []);

	return (
		<Layout>
			<div className="text-blue-900 flex justify-between items-center">
				<h2>
					Hello, <b>{session?.user?.name}</b>
				</h2>
				<div className="flex bg-gray-300 text-black gap-1 items-center rounded-lg overflow-hidden">
					<img src={session?.user?.image} alt="" className="w-6 h-6" />
					<span className="px-2">{session?.user?.name}</span>
				</div>
			</div>

			<div className="mt-8 grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
				<StatsCard label={"New orders"}>{stats.newOrders}</StatsCard>
				<StatsCard label={"Last updated product"} size="lg" fontWeight={""}>
					{stats.lastEditedProduct}
				</StatsCard>
				<StatsCard
					label={"Number of products"}
					color="green-700"
					className="text-green-700">
					{stats.totalProducts}
				</StatsCard>
				<StatsCard>
					<ProfitChart />
				</StatsCard>
			</div>
		</Layout>
	);
}
