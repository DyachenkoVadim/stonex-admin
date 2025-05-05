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
import {
	Chart,
	getDatasetAtEvent,
	getElementAtEvent,
	getElementsAtEvent,
} from "react-chartjs-2";
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

	useEffect(() => {
		axios.get("/api/stats/profit").then((res) => {
			const data = res.data;
			console.log(data);
			const keys = Object.keys(data); // вже в правильному порядку
			setLabels(
				keys.map((key) => {
					const [year, month] = key.split("-");
					return new Date(+year, +month - 1).toLocaleString("default", {
						month: "short",
						year: "numeric",
					});
				})
			);
			setProfits(keys.map((key) => data[key]));
		});
	}, []);

	const chartData = {
		labels,
		datasets: [
			{
				type: "line",
				label: "Monthly Profit ($)",
				borderColor: "rgb(75, 192, 192)",
				borderWidth: 2,
				fill: false,
				data: profits,
			},
		],
	};

	const chartRef = useRef(null);

	const onClick = (event) => {
		const chart = chartRef.current;
		if (!chart) return;

		const element = getElementAtEvent(chart, event);
		if (element.length) {
			const { index } = element[0];
			console.log(`Clicked ${labels[index]}: $${profits[index]}`);
		}
	};

	return <Chart ref={chartRef} type="bar" onClick={onClick} data={chartData} />;
}
