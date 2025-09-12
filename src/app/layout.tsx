import { Outfit } from "next/font/google";
import "./globals.css";

import { SidebarProvider } from "@/context/SidebarContext";
import { ThemeProvider } from "@/context/ThemeContext";
import AuthInit from "@/providers/AuthInit";

const outfit = Outfit({
	subsets: ["latin"],
});

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body className={`${outfit.className} dark:bg-gray-900`}>
				<AuthInit />
				<ThemeProvider>
					<SidebarProvider>{children}</SidebarProvider>
				</ThemeProvider>
			</body>
		</html>
	);
}
