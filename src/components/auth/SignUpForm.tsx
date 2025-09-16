"use client";

import Checkbox from "@/components/form/input/Checkbox";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "@/icons";
import Link from "next/link";
import React, { useState } from "react";
import { authService } from "@/services/AuthService";
import { useAuthStore } from "@/stores/useAuthStore";

export default function SignUpForm() {
	const [showPassword, setShowPassword] = useState(false);
	const [isChecked, setIsChecked] = useState(false);
	const [loading, setLoading] = useState<
		"none" | "email" | "google" | "facebook"
	>("none");
	const [error, setError] = useState<string | null>(null);

	const setFromFirebase = useAuthStore((s) => s.setFromFirebase);

	async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		setError(null);
		setLoading("email");

		const formData = new FormData(e.currentTarget);
		const fname = (formData.get("fname") as string) || "";
		const lname = (formData.get("lname") as string) || "";
		const email = (formData.get("email") as string) || "";
		const password = (formData.get("password") as string) || "";

		if (!isChecked) {
			setError("Debes aceptar los términos y condiciones.");
			setLoading("none");
			return;
		}

		try {
			// Flujo normal: el usuario queda logueado
			const fbUser = await authService.signUpSelf(
				email,
				password,
				fname,
				lname,
				"client"
			);
			const simple = authService.toSimpleUser(fbUser);
			await setFromFirebase(simple as any);
			// TODO: redirige si quieres (router.push('/dashboard'))
		} catch (err: any) {
			setError(err?.message || "Error al crear la cuenta");
		} finally {
			setLoading("none");
		}
	}

	async function handleGoogle() {
		setError(null);
		setLoading("google");
		try {
			const fbUser = await authService.signInWithGoogle("client");
			const simple = authService.toSimpleUser(fbUser);
			await setFromFirebase(simple as any);
			// TODO: redirige
		} catch (err: any) {
			setError(err?.message || "No se pudo iniciar con Google");
		} finally {
			setLoading("none");
		}
	}

	async function handleFacebook() {
		setError(null);
		setLoading("facebook");
		try {
			const fbUser = await authService.signInWithFacebook("client");
			const simple = authService.toSimpleUser(fbUser);
			await setFromFirebase(simple as any);
			// TODO: redirige
		} catch (err: any) {
			// Si Facebook bloquea popups de 3ros, revisa configuración de OAuth
			setError(err?.message || "No se pudo iniciar con Facebook");
		} finally {
			setLoading("none");
		}
	}

	const isBusy = loading !== "none";

	return (
		<div className="flex flex-col flex-1 lg:w-1/2 w-full overflow-y-auto no-scrollbar">
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
							Crear cuenta
						</h1>
						<p className="text-sm text-gray-500 dark:text-gray-400">
							Ingresa tu correo y contraseña para registrarte.
						</p>
					</div>

					<form onSubmit={handleSubmit}>
						<div className="space-y-5">
							<div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
								<div>
									<Label>
										Nombre<span className="text-error-500">*</span>
									</Label>
									<Input
										type="text"
										id="fname"
										name="fname"
										placeholder="Ingresa tu nombre"
										required
									/>
								</div>
								<div>
									<Label>
										Apellido<span className="text-error-500">*</span>
									</Label>
									<Input
										type="text"
										id="lname"
										name="lname"
										placeholder="Ingresa tu apellido"
										required
									/>
								</div>
							</div>

							<div>
								<Label>
									Correo electrónico<span className="text-error-500">*</span>
								</Label>
								<Input
									type="email"
									id="email"
									name="email"
									placeholder="Ingresa tu correo"
									required
								/>
							</div>

							<div>
								<Label>
									Contraseña<span className="text-error-500">*</span>
								</Label>
								<div className="relative">
									<Input
										placeholder="Ingresa tu contraseña"
										type={showPassword ? "text" : "password"}
										id="password"
										name="password"
										required
									/>
									<span
										onClick={() => setShowPassword(!showPassword)}
										className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
										aria-label={
											showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
										}
									>
										{showPassword ? (
											<EyeIcon className="fill-gray-500 dark:fill-gray-400" />
										) : (
											<EyeCloseIcon className="fill-gray-500 dark:fill-gray-400" />
										)}
									</span>
								</div>
							</div>

							<div className="flex items-center gap-3">
								<Checkbox
									className="w-5 h-5"
									checked={isChecked}
									onChange={setIsChecked}
								/>
								<p className="inline-block font-normal text-gray-500 dark:text-gray-400">
									Al crear una cuenta aceptas los{" "}
									<span className="text-gray-800 dark:text-white/90">
										Términos y Condiciones
									</span>
									, y nuestra{" "}
									<span className="text-gray-800 dark:text-white">
										Política de Privacidad
									</span>
									.
								</p>
							</div>

							{error && <p className="text-sm text-red-500">{error}</p>}

							<div className="space-y-3">
								<button
									type="submit"
									disabled={isBusy}
									className="flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-white transition rounded-lg bg-brand-500 shadow-theme-xs hover:bg-brand-600 disabled:opacity-50"
								>
									{loading === "email" ? "Creando..." : "Crear cuenta"}
								</button>

								<div className="relative flex items-center justify-center">
									<span className="h-px w-full bg-gray-200 dark:bg-gray-800" />
									<span className="absolute bg-white dark:bg-gray-900 px-3 text-xs text-gray-500">
										o continuar con
									</span>
								</div>

								<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
									<button
										type="button"
										onClick={handleGoogle}
										disabled={isBusy}
										className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800 disabled:opacity-50"
									>
										{loading === "google" ? "Abriendo Google..." : "Google"}
									</button>
									<button
										type="button"
										onClick={handleFacebook}
										disabled={isBusy}
										className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800 disabled:opacity-50"
									>
										{loading === "facebook"
											? "Abriendo Facebook..."
											: "Facebook"}
									</button>
								</div>
							</div>
						</div>
					</form>

					<div className="mt-5">
						<p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
							¿Ya tienes una cuenta?{" "}
							<Link
								href="/signin"
								className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
							>
								Inicia sesión
							</Link>
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
