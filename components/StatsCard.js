export default function StatsCard({
	children,
	label,
	color = "primary ",
	size = "3xl ",
	fontWeight = "font-bold ",
	className = "",
}) {
	return (
		<div className={`bg-white p-6 rounded-lg shadow-md ${className}`}>
			<h3 className="text-gray-500 text-sm 2xl:text-lg">{label}</h3>
			<div
				className={
					"text-" + size + fontWeight + "text-" + color + " 2xl:text-2xl h-full"
				}>
				{children}
			</div>
		</div>
	);
}
