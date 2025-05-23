import Layout from "@/components/Layout";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import axios from "axios";
import StatsCard from "@/components/StatsCard";
import ProfitChart from "@/components/ProfitChart";
import Spinner from "@/components/Spinner";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowTrendUp } from "@fortawesome/free-solid-svg-icons";
import { faArrowTrendDown } from "@fortawesome/free-solid-svg-icons";

export default function Home() {
	const { data: session } = useSession();
	const [stats, setStats] = useState({
		newOrders: 0,
		lastEditedProduct: "—",
		totalProducts: 0,
	});
	const [topProduct, setTopProduct] = useState({
		title: "—",
		count: 0,
		profit: 0,
		orderGrowth: 0,
		profitGrowth: 0,
		averageRating: 0,
		maxRating: 0,
		maxRatingCount: 0,
		ratingsCount: 0,
	});

	useEffect(() => {
		async function fetchStats() {
			try {
				const [productsRes, ordersRes, topProductRes] = await Promise.all([
					axios.get("/api/products"),
					axios.get("/api/orders"),
					axios.get("/api/stats/profit"),
				]);

				console.log(topProductRes);

				setTopProduct(topProductRes.data.topProduct);

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
			<div className="text-primary flex justify-between items-center">
				<h2 className="2xl:text-2xl">
					Hello, <b>{session?.user?.name}</b>
				</h2>
				<div className="flex bg-gray-300 text-black gap-1 items-center rounded-lg overflow-hidden">
					<img
						src={session?.user?.image}
						alt=""
						className="w-6 h-6 2xl:w-8 2xl:h-8"
					/>
					<span className="px-2 2xl:text-lg">{session?.user?.name}</span>
				</div>
			</div>

			<div className="mt-8 grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
				<StatsCard label={"New orders"}>{stats.newOrders}</StatsCard>

				<StatsCard
					label={"Number of products"}
					color="greenPrimary"
					className="text-greenPrimary">
					{stats.totalProducts}
				</StatsCard>

				<StatsCard
					label={"Last updated product"}
					size="lg"
					fontWeight={""}
					className="col-span-1 md:col-span-2 lg:col-span-1">
					{stats.lastEditedProduct}
				</StatsCard>
				<StatsCard className="h-fit">
					{topProduct.title !== "—" ? (
						<div className="size-full">
							<h3 className="text-gray-500 text-sm 2xl:text-md font-normal">
								Top product this month
							</h3>
							<p className="text-center my-2 font-semibold">
								{topProduct.title}
							</p>
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 h-fit">
								<div>
									<h4 className="text-gray-400 text-sm font-normal mb-4">
										Amount sold
									</h4>
									<p
										className={`my-1 ${
											topProduct.orderGrowth > 0
												? "text-greenPrimary"
												: "text-red-700"
										}`}>
										{topProduct.orders} orders
										<span className="ml-2">
											{topProduct.orderGrowth > 0 ? (
												<FontAwesomeIcon icon={faArrowTrendUp} />
											) : (
												<FontAwesomeIcon icon={faArrowTrendDown} />
											)}{" "}
											{topProduct.orderGrowth}%
										</span>
									</p>
								</div>
								<div>
									<h4 className="text-gray-400 text-sm font-normal mb-4">
										Total profit
									</h4>
									<p
										className={`my-1 ${
											topProduct.profitGrowth > 0
												? "text-greenPrimary"
												: "text-red-700"
										}`}>
										${topProduct.profit} profit
										<span className="ml-2">
											{topProduct.profitGrowth > 0 ? (
												<FontAwesomeIcon icon={faArrowTrendUp} />
											) : (
												<FontAwesomeIcon icon={faArrowTrendDown} />
											)}{" "}
											{topProduct.profitGrowth}%
										</span>
									</p>
								</div>
								<div>
									<h4 className="text-gray-400 text-sm font-normal">
										Average rating
									</h4>
									<p className="my-1 text-center text-primary font-semibold text-lg">
										{topProduct.averageRating?.toFixed(1) || "—"} / 5
									</p>
								</div>
								<div>
									<h4 className="text-gray-400 text-sm font-normal">
										Highest rating
									</h4>
									<p className="my-1 text-center text-primary font-semibold text-lg">
										{topProduct.maxRating || "—"} ★
									</p>
								</div>
								<div>
									<h4 className="text-gray-400 text-sm font-normal">
										Total ratings
									</h4>
									<p className="my-1 text-center font-medium">
										{topProduct.ratingsCount || 0}
									</p>
								</div>
								<div>
									<h4 className="text-gray-400 text-sm font-normal">
										Times rated highest
									</h4>
									<p className="my-1 text-center font-medium">
										{topProduct.maxRatingCount || 0}
									</p>
								</div>
							</div>
						</div>
					) : (
						<div className="size-full flex items-center justify-center">
							<Spinner />
						</div>
					)}
				</StatsCard>
				<StatsCard className="col-span-1 md:col-span-2">
					<ProfitChart />
				</StatsCard>
			</div>
		</Layout>
	);
}
