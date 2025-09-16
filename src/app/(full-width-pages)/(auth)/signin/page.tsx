import SignInForm from "@/components/auth/SignInForm";
import { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
	title: "Inicio de Sesion | GOSD Arquitectura",
	description: "Esta es la página de inicio de sesión de GOSD Arquitectura",
};

export default function SignIn() {
	return (
		<Suspense fallback={null}>
			<SignInForm />
		</Suspense>
	);
}
