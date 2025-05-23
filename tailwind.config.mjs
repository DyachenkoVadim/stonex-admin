/** @type {import('tailwindcss').Config} */
export default {
	content: [
		"./pages/**/*.{js,ts,jsx,tsx,mdx}",
		"./components/**/*.{js,ts,jsx,tsx,mdx}",
		"./app/**/*.{js,ts,jsx,tsx,mdx}",
	],
	theme: {
		extend: {
			colors: {
				background: "var(--background)",
				foreground: "var(--foreground)",
				primary: "#5542F6",
				highlight: "#EAE8FB",
				bgGray: "#fbfafd",
				greenPrimary: "#00EB6F",
			},
			fontSize: {
				base: "1.25rem",
			},
			screens: {
				"2xl": "1920px",
			},
		},
	},
	plugins: [],
};
