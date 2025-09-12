"use client";

import { useState, useRef, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { Modal } from "@/components/ui/modal";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import Select from "@/components/form/Select";
import Button from "@/components/ui/button/Button";
import { authService } from "@/services/AuthService";
import { RoleKey } from "@/lib/types/role-key.type";
import { ROLES } from "@/lib/constants/roles";

type FormValues = {
	firstName: string;
	lastName: string;
	email: string;
	password: string;
	confirmPassword: string;
	roleKey: RoleKey | "";
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function RegisterUserModal({
	isOpen,
	onClose,
	onSuccess,
	showCloseButton = true,
	isFullscreen = false,
}: {
	isOpen: boolean;
	onClose: () => void;
	onSuccess?: (args: { uid: string; displayName: string | null }) => void;
	showCloseButton?: boolean;
	isFullscreen?: boolean;
}) {
	const [serverError, setServerError] = useState<string | null>(null);
	const [createdName, setCreatedName] = useState<string | null>(null);
	const [selectKey, setSelectKey] = useState<number>(0);
	const closeTimerRef = useRef<number | null>(null);

	const {
		register,
		control,
		handleSubmit,
		watch,
		formState: { errors, isSubmitting },
		reset,
	} = useForm<FormValues>({
		defaultValues: {
			firstName: "",
			lastName: "",
			email: "",
			password: "",
			confirmPassword: "",
			roleKey: "",
		},
		mode: "onTouched",
	});

	const pwd = watch("password");

	useEffect(() => {
		return () => {
			if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current);
		};
	}, []);

	function hardReset() {
		setServerError(null);
		setCreatedName(null);
		reset();
		setSelectKey((k) => k + 1);
	}

	function handleClose() {
		hardReset();
		onClose();
	}

	async function onSubmit(v: FormValues) {
		setServerError(null);
		setCreatedName(null);
		try {
			const user = await authService.signUp(
				v.email,
				v.password,
				v.firstName,
				v.lastName,
				v.roleKey as RoleKey
			);
			const name = user.displayName || `${v.firstName} ${v.lastName}`;
			setCreatedName(name);
			onSuccess?.({ uid: user.uid, displayName: name });
		} catch (err: any) {
			const code = err?.code as string | undefined;
			const message =
				code === "auth/email-already-in-use"
					? "El email ya está en uso."
					: code === "auth/invalid-email"
					? "Email inválido."
					: code === "auth/weak-password"
					? "La contraseña es muy débil."
					: err?.message?.replace("Firebase:", "").trim() ||
					  "No se pudo crear el usuario.";
			setServerError(message);
		}
	}

	return (
		<Modal
			isOpen={isOpen}
			onClose={handleClose}
			className="max-w-xl p-6 sm:p-8"
			showCloseButton={showCloseButton}
			isFullscreen={isFullscreen}
		>
			<h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white/90">
				{createdName ? "Usuario creado" : "Registrar usuario"}
			</h3>
			<p className="mb-5 text-sm text-gray-500 dark:text-gray-400">
				{createdName
					? "El usuario se creó correctamente. ¿Qué deseas hacer ahora?"
					: "Crea una cuenta y asigna su rol."}
			</p>

			{createdName ? (
				<div className="space-y-6">
					<div className="rounded-lg border border-success-500/40 bg-success-50 px-4 py-3 dark:border-success-500/30 dark:bg-success-500/15">
						<div className="text-sm">
							<span className="font-semibold">✅ {createdName}</span> fue creado
							correctamente.
						</div>
					</div>

					<div className="flex items-center justify-end gap-2">
						<Button
							variant="outline"
							onClick={() => {
								hardReset();
							}}
						>
							Crear otro
						</Button>
						<Button onClick={handleClose}>Cerrar</Button>
					</div>
				</div>
			) : (
				<>
					{serverError && (
						<div className="mb-4 rounded-lg border border-error-500/40 bg-error-50 px-4 py-3 text-sm text-error-700 dark:border-error-500/30 dark:bg-error-500/15 dark:text-error-400">
							{serverError}
						</div>
					)}

					<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
							<div>
								<Label htmlFor="firstName">Nombres</Label>
								<Input
									id="firstName"
									placeholder="Juan"
									autoComplete="given-name"
									error={!!errors.firstName}
									hint={errors.firstName?.message}
									{...register("firstName", {
										required: "Requerido",
										minLength: { value: 2, message: "Mínimo 2 caracteres" },
									})}
								/>
							</div>

							<div>
								<Label htmlFor="lastName">Apellidos</Label>
								<Input
									id="lastName"
									placeholder="Pérez"
									autoComplete="family-name"
									error={!!errors.lastName}
									hint={errors.lastName?.message}
									{...register("lastName", {
										required: "Requerido",
										minLength: { value: 2, message: "Mínimo 2 caracteres" },
									})}
								/>
							</div>
						</div>

						<div>
							<Label htmlFor="email">Email</Label>
							<Input
								id="email"
								type="email"
								placeholder="nombre@empresa.com"
								autoComplete="email"
								error={!!errors.email}
								hint={errors.email?.message}
								{...register("email", {
									required: "Requerido",
									pattern: { value: emailPattern, message: "Email inválido" },
								})}
							/>
						</div>

						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
							<div>
								<Label htmlFor="password">Contraseña</Label>
								<Input
									id="password"
									type="password"
									placeholder="********"
									autoComplete="new-password"
									error={!!errors.password}
									hint={errors.password?.message}
									{...register("password", {
										required: "Requerido",
										minLength: { value: 8, message: "Mínimo 8 caracteres" },
									})}
								/>
							</div>

							<div>
								<Label htmlFor="confirmPassword">Confirmar contraseña</Label>
								<Input
									id="confirmPassword"
									type="password"
									placeholder="********"
									autoComplete="new-password"
									error={!!errors.confirmPassword}
									hint={errors.confirmPassword?.message}
									{...register("confirmPassword", {
										required: "Requerido",
										validate: (value) =>
											value === pwd || "Las contraseñas no coinciden",
									})}
								/>
							</div>
						</div>

						<div>
							<Label htmlFor="roleKey">Rol</Label>
							<Controller
								control={control}
								name="roleKey"
								rules={{
									required: "Selecciona un rol",
									validate: (v) => v !== "" || "Selecciona un rol",
								}}
								render={({ field }) => (
									<div key={selectKey}>
										<Select
											options={ROLES}
											placeholder="Selecciona un rol…"
											defaultValue={field.value || ""}
											onChange={(val) => field.onChange(val as RoleKey)}
										/>
										{errors.roleKey && (
											<p className="mt-1.5 text-xs text-error-500">
												{errors.roleKey.message as string}
											</p>
										)}
									</div>
								)}
							/>
						</div>

						<div className="mt-6 flex items-center justify-end gap-2">
							<Button variant="outline" onClick={handleClose}>
								Cancelar
							</Button>
							<Button type="submit" disabled={isSubmitting}>
								{isSubmitting && (
									<svg
										className="mr-2 h-4 w-4 animate-spin"
										viewBox="0 0 24 24"
										fill="none"
									>
										<circle
											className="opacity-25"
											cx="12"
											cy="12"
											r="10"
											stroke="currentColor"
											strokeWidth="4"
										/>
										<path
											className="opacity-75"
											fill="currentColor"
											d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
										/>
									</svg>
								)}
								Crear cuenta
							</Button>
						</div>
					</form>
				</>
			)}
		</Modal>
	);
}
