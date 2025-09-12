import AuthGuard from "@/components/auth/AuthGuard";
import { SidebarProvider } from "@/context/SidebarContext";

export default function DashboardLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<>
			<SidebarProvider>
				<AuthGuard>{children}</AuthGuard>
			</SidebarProvider>
		</>
	);
}
