import React, { useEffect, useRef, useState } from "react";
import {
	Chart as ChartJS,
	LinearScale,
	CategoryScale,
	BarElement,
	PointElement,
	LineElement,
	Legend,
	Tooltip,
} from "chart.js";
import { Chart, getElementAtEvent } from "react-chartjs-2";
import axios from "axios";

ChartJS.register(
	LinearScale,
	CategoryScale,
	BarElement,
	PointElement,
	LineElement,
	Legend,
	Tooltip
);

export default function ProfitChart() {
	const [labels, setLabels] = useState([]);
	const [profits, setProfits] = useState([]);
	const [orders, setOrders] = useState([]);

	useEffect(() => {
		axios.get("/api/stats/profit").then((res) => {
			const data = res.data.monthlyData;
			const keys = Object.keys(data);

			setLabels(
				keys.map((key) => {
					const [year, month] = key.split("-");
					return new Date(+year, +month - 1).toLocaleString("default", {
						month: "numeric",
						year: "numeric",
					});
				})
			);

			setProfits(keys.map((key) => data[key].profit));
			setOrders(keys.map((key) => data[key].orders));
		});
	}, []);

	const chartData = {
		labels,
		datasets: [
			{
				type: "line",
				label: "Monthly Profit ($)",
				borderColor: "#5542F6",
				borderWidth: 2,
				fill: false,
				data: profits,
				tension: 0.3,
				pointRadius: 5,
				pointHoverRadius: 7,
			},
		],
	};

	const options = {
		responsive: true,
		plugins: {
			tooltip: {
				callbacks: {
					label: function (context) {
						const index = context.dataIndex;
						const profit = profits[index] ?? 0;
						const orderCount = orders[index] ?? 0;
						return [`Profit: $${profit}`, `Orders: ${orderCount}`];
					},
				},
			},
			legend: {
				display: true,
			},
		},
		scales: {
			y: {
				beginAtZero: true,
				ticks: {
					callback: (value) => `$${value}`,
				},
			},
		},
	};

	const chartRef = useRef(null);

	const onClick = (event) => {
		const chart = chartRef.current;
		if (!chart) return;

		const element = getElementAtEvent(chart, event);
		if (element.length) {
			const index = element[0].index;
			console.log(
				`Clicked ${labels[index]}: $${profits[index]}, ${orders[index]} orders`
			);
		}
	};

	return (
		<Chart
			ref={chartRef}
			type="bar"
			onClick={onClick}
			data={chartData}
			options={options}
		/>
	);
}
