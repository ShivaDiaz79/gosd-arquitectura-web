import NavbarPublic from "@/components/shared/Navbar";
import FooterPublic from "@/components/shared/Footer";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "GOSD Arquitectos",
  description:
    "GOSD Arquitectos - Servicios de arquitectura y diseño innovador",
}

export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <NavbarPublic />
      <main className="flex-1">{children}</main>
      <FooterPublic />
    </div>
  );
}
