"use client";
import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import Button from "@/components/ui/button/Button";
import { UsersService } from "@/services/UsersService";

export default function ChangePasswordModal({
	isOpen,
	onClose,
	userId,
	userName,
	email,
}: {
	isOpen: boolean;
	onClose: () => void;
	userId: string;
	userName?: string | null;
	email?: string | null;
}) {
	const [password, setPassword] = useState("");
	const [confirm, setConfirm] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [done, setDone] = useState<"set" | "email" | null>(null);
	const [loading, setLoading] = useState(false);

	async function setNewPassword() {
		setError(null);
		if (!password || password.length < 6)
			return setError("Mínimo 6 caracteres");
		if (password !== confirm) return setError("Las contraseñas no coinciden");
		try {
			setLoading(true);
			await UsersService.setPassword(userId, password);
			setDone("set");
		} catch (e: any) {
			setError(e?.message ?? "No se pudo cambiar la contraseña");
		} finally {
			setLoading(false);
		}
	}

	async function sendEmail() {
		if (!email) return setError("Este usuario no tiene email");
		try {
			setLoading(true);
			await UsersService.sendResetEmail(email);
			setDone("email");
		} catch (e: any) {
			setError(e?.message ?? "No se pudo enviar el email de restablecimiento");
		} finally {
			setLoading(false);
		}
	}

	const successMessage =
		done === "set"
			? "La contraseña se actualizó correctamente."
			: done === "email"
			? "Se envió un email de restablecimiento."
			: null;

	return (
		<Modal isOpen={isOpen} onClose={onClose} className="max-w-md p-6 sm:p-8">
			<h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white/90">
				Cambiar contraseña
			</h3>
			<p className="mb-5 text-sm text-gray-500 dark:text-gray-400">
				{userName || email || userId}
			</p>

			{successMessage ? (
				<div className="space-y-6">
					<div className="rounded-lg border border-success-500/40 bg-success-50 px-4 py-3 dark:border-success-500/30 dark:bg-success-500/15 text-sm">
						✅ {successMessage}
					</div>
					<div className="flex justify-end">
						<Button onClick={onClose}>Cerrar</Button>
					</div>
				</div>
			) : (
				<>
					{error && (
						<div className="mb-4 rounded-lg border border-error-500/40 bg-error-50 px-4 py-3 text-sm text-error-700 dark:border-error-500/30 dark:bg-error-500/15 dark:text-error-400">
							{error}
						</div>
					)}

					<div className="space-y-4">
						<div>
							<Label htmlFor="newpwd">Nueva contraseña</Label>
							<Input
								id="newpwd"
								type="password"
								placeholder="********"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								error={!!error && (!password || password.length < 6)}
								hint={!password || password.length < 6 ? undefined : ""}
							/>
						</div>
						<div>
							<Label htmlFor="confpwd">Confirmar contraseña</Label>
							<Input
								id="confpwd"
								type="password"
								placeholder="********"
								value={confirm}
								onChange={(e) => setConfirm(e.target.value)}
								error={!!error && password !== confirm}
							/>
						</div>
					</div>

					<div className="mt-6 flex flex-wrap items-center justify-end gap-2">
						<Button
							variant="outline"
							onClick={sendEmail}
							disabled={loading || !email}
							title={email ? "" : "Usuario sin email"}
						>
							Enviar email de restablecimiento
						</Button>
						<Button onClick={setNewPassword} disabled={loading}>
							{loading && (
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
							Establecer nueva contraseña
						</Button>
					</div>
				</>
			)}
		</Modal>
	);
}
