import SignInForm from "@/components/auth/SignInForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Inicio de Sesion | TailAdmin - Next.js Dashboard Template",
  description: "Esta es la página de inicio de sesión de Next.js",
};

export default function SignIn() {
  return <SignInForm />;
}
