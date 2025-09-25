import { Outfit } from "next/font/google";
import { Jost } from "next/font/google";
import "./globals.css";

import { SidebarProvider } from "@/context/SidebarContext";
import { ThemeProvider } from "@/context/ThemeContext";
import AuthInit from "@/providers/AuthInit";

const outfit = Outfit({
	subsets: ["latin"],
});

const jost = Jost({
	subsets: ["latin"],
	weight: ["400", "500", "600", "700"],
	variable: "--font-jost",
	display: "swap",
	fallback: ["sans-serif"],
});

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body className={`${jost.className} dark:bg-gray-900`}>
				<AuthInit />
				<ThemeProvider>
					<SidebarProvider>{children}</SidebarProvider>
				</ThemeProvider>
			</body>
		</html>
	);
}
