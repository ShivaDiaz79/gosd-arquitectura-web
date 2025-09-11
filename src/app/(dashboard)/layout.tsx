import { SidebarProvider } from '@/context/SidebarContext';

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <SidebarProvider>{children}</SidebarProvider>
    </>
  );
}
