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
		totalProducts: 0,
		totalProfit: 0,
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

				setTopProduct(topProductRes.data.topProduct);

				const products = productsRes.data;
				const orders = ordersRes.data;

				const newOrders = orders.filter((order) => !order.viewed);

				// 🔽 Рахуємо лише оплачені замовлення
				const paidOrders = orders.filter((order) => order.paid);

				// 🔽 Обчислюємо сумарний прибуток
				const totalProfit = paidOrders.reduce((sum, order) => {
					const orderTotal = order.line_items.reduce((lineSum, item) => {
						const quantity = item.quantity || 0;
						const unitAmount = item.price_data?.unit_amount || 0;
						return lineSum + quantity * unitAmount;
					}, 0);
					return sum + orderTotal;
				}, 0);

				// 🔽 Якщо потрібно — переводимо з копійок у долари
				const totalProfitInDollars = new Intl.NumberFormat("uk-UA", {
					style: "decimal",
					minimumFractionDigits: 2,
					maximumFractionDigits: 2,
				}).format(totalProfit / 100);

				setStats({
					newOrders: newOrders.length,
					totalProducts: products.length,
					totalProfit: totalProfitInDollars,
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
					Вітаю, <b>{session?.user?.name}</b>
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
				<StatsCard label={"Нових замовлень"}>{stats.newOrders}</StatsCard>

				<StatsCard
					label={"Загальна кількість продуктів"}
					color="greenPrimary"
					className="text-greenPrimary">
					{stats.totalProducts}
				</StatsCard>

				<StatsCard
					label={"Сумарний прибуток"}
					color="greenPrimary"
					className="col-span-1 md:col-span-2 lg:col-span-1 text-primary">
					${stats.totalProfit}
				</StatsCard>

				<StatsCard className="h-fit">
					{topProduct.title !== "—" ? (
						<div className="size-full">
							<h3 className="text-gray-500 text-sm 2xl:text-md font-normal">
								Топ продукт цього місяця
							</h3>
							<p className="text-center my-2 font-semibold">
								{topProduct.title}
							</p>
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 h-fit">
								<div>
									<h4 className="text-gray-400 text-sm font-normal mb-4">
										Кількість продано
									</h4>
									<p
										className={`my-1 ${
											topProduct.orderGrowth > 0
												? "text-greenPrimary"
												: "text-red-700"
										}`}>
										{topProduct.orders} замовлень
										<br />
										<span className="ml-2">
											(
											{topProduct.orderGrowth > 0 ? (
												<FontAwesomeIcon icon={faArrowTrendUp} />
											) : (
												<FontAwesomeIcon icon={faArrowTrendDown} />
											)}{" "}
											{topProduct.orderGrowth}%)
										</span>
									</p>
								</div>
								<div>
									<h4 className="text-gray-400 text-sm font-normal mb-4">
										Заробіток з продажу
									</h4>
									<p
										className={`my-1 ${
											topProduct.profitGrowth > 0
												? "text-greenPrimary"
												: "text-red-700"
										}`}>
										${topProduct.profit} прибутку <br />(
										<span className="ml-2">
											{topProduct.profitGrowth > 0 ? (
												<FontAwesomeIcon icon={faArrowTrendUp} />
											) : (
												<FontAwesomeIcon icon={faArrowTrendDown} />
											)}{" "}
											{topProduct.profitGrowth}%)
										</span>
									</p>
								</div>
								<div>
									<h4 className="text-gray-400 text-sm font-normal">
										Середня оцінка
									</h4>
									<p className="my-1 text-center text-primary">
										{topProduct.averageRating?.toFixed(1) || "—"} / 5
									</p>
								</div>
								<div>
									<h4 className="text-gray-400 text-sm font-normal">
										Найвища оцінка
									</h4>
									<p className="my-1 text-center text-primary">
										{topProduct.maxRating || "—"} ★
									</p>
								</div>
								<div>
									<h4 className="text-gray-400 text-sm font-normal">
										Усього оцінок
									</h4>
									<p className="my-1 text-center">
										{topProduct.ratingsCount || 0}
									</p>
								</div>
								<div>
									<h4 className="text-gray-400 text-sm font-normal">
										Кількість найвищих оцінок
									</h4>
									<p className="my-1 text-center">
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
