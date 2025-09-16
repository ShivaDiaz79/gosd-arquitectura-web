import SignUpForm from "@/components/auth/SignUpForm";
import { Metadata } from "next";

export const metadata: Metadata = {
	title: "Registro | GOSD Arquitectura",
	description: "Esta es la página de registro de GOSD Arquitectura",
};

export default function SignUp() {
	return <SignUpForm />;
}
