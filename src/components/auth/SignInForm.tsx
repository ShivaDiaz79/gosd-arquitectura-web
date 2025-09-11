"use client";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "@/icons";
import Link from "next/link";
import React, { useState } from "react";
import { authService } from "@/services/AuthService";
import { useRouter } from "next/navigation";
import Checkbox from "@/components/form/input/Checkbox";
import { useAuthStore } from "@/stores/useAuthStore";

export default function SignInForm() {
	const [showPassword, setShowPassword] = useState(false);
	const [isChecked, setIsChecked] = useState(false);
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const router = useRouter();
	const auth = useAuthStore((s) => s.signIn);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		setLoading(true);

		try {
			await auth(email, password);
			router.push("/dashboard");
		} catch (err) {
			setError("Correo o contraseña incorrectos");
			console.error(err);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="flex flex-col flex-1 lg:w-1/2 w-full">
			<div className="w-full max-w-md sm:pt-10 mx-auto mb-5">
				<Link
					href="/"
					className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
				>
					<ChevronLeftIcon />
					Volver al inicio
				</Link>
			</div>
			<div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
				<div>
					<div className="mb-5 sm:mb-8">
						<h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
							Iniciar sesión
						</h1>
						<p className="text-sm text-gray-500 dark:text-gray-400">
							Ingresa tu correo y contraseña para iniciar sesión.
						</p>
					</div>

					{/* Formulario de login */}
					<form onSubmit={handleSubmit}>
						<div className="space-y-6">
							<div>
								<Label>
									Correo electrónico <span className="text-error-500">*</span>
								</Label>
								<Input
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									placeholder="info@gmail.com"
									type="email"
									required
								/>
							</div>

							<div>
								<Label>
									Contraseña <span className="text-error-500">*</span>
								</Label>
								<div className="relative">
									<Input
										type={showPassword ? "text" : "password"}
										value={password}
										onChange={(e) => setPassword(e.target.value)}
										placeholder="Ingresa tu contraseña"
										required
									/>
									<span
										onClick={() => setShowPassword(!showPassword)}
										className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
									>
										{showPassword ? (
											<EyeIcon className="fill-gray-500 dark:fill-gray-400" />
										) : (
											<EyeCloseIcon className="fill-gray-500 dark:fill-gray-400" />
										)}
									</span>
								</div>
							</div>

							<div className="flex items-center justify-between">
								<div className="flex items-center gap-3">
									<Checkbox checked={isChecked} onChange={setIsChecked} />
									<span className="block font-normal text-gray-700 text-theme-sm dark:text-gray-400">
										Mantener sesión iniciada
									</span>
								</div>
								<Link
									href="/reset-password"
									className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400"
								>
									¿Olvidaste tu contraseña?
								</Link>
							</div>

							{error && (
								<p className="text-sm text-red-500 text-center">{error}</p>
							)}

							<div>
								<Button
									type="submit"
									disabled={loading}
									className="w-full"
									size="sm"
								>
									{loading ? "Ingresando..." : "Iniciar sesión"}
								</Button>
							</div>
						</div>
					</form>

					<div className="mt-5">
						<p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
							¿No tienes una cuenta?{" "}
							<Link
								href="/signup"
								className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
							>
								Regístrate
							</Link>
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
