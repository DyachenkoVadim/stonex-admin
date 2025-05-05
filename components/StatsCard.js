export default function StatsCard({
	children,
	label,
	color = "blue-900 ",
	size = "3xl ",
	fontWeight = "font-bold ",
	className = "",
}) {
	return (
		<div className={`bg-white p-6 rounded-lg shadow-md ${className}`}>
			<h3 className="text-gray-500 text-sm">{label}</h3>
			<p className={"text-" + size + fontWeight + "text-" + color}>
				{children}
			</p>
		</div>
	);
}
