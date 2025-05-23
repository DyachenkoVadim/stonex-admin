import Nav from "@/components/Nav";
import { useSession, signIn } from "next-auth/react";
import { useState } from "react";
import Logo from "./Logo";

export default function Layout({ children }) {
	const { data: session } = useSession();
	const [showNav, setShowNav] = useState(false);
	if (!session) {
		return (
			<div className="bg-bgGray w-screen h-screen flex items-center">
				<div className="text-center w-full">
					<button
						className="bg-white p-2 rounded-md px-4"
						onClick={() => signIn("google")}>
						{"Login with Google"}
					</button>
				</div>
			</div>
		);
	}
	return (
		<div className="bg-bgGray min-h-screen w-screen">
			<div className="md:hidden flex items-center p-4 relative">
				<button onClick={() => setShowNav(true)}>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						strokeWidth={1.5}
						stroke="currentColor"
						className="size-6">
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12"
						/>
					</svg>
				</button>
				<div className="flex grow justify-center mr-6">
					<Logo />
				</div>
			</div>
			<div className="flex min-h-screen">
				<Nav show={showNav} setShow={setShowNav} />
				<div className="flex-grow p-4">{children}</div>
			</div>
		</div>
	);
}
