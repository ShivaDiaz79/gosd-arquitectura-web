"use client";

import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import RHFInput from "@/components/form/RHFInput";
import Button from "@/components/ui/button/Button";
import { CotizadorService } from "@/services/CotizadorService";
import type { CotizadorConfig } from "@/services/CotizadorService";

type FormData = {
	label: string;
	value: string;
};

function slugify(input: string) {
	return input
		.toLowerCase()
		.normalize("NFD")
		.replace(/\p{Diacritic}/gu, "")
		.replace(/\s+/g, "_")
		.replace(/[^a-z0-9_]/g, "");
}

export default function ServicioOpcionesForm() {
	const [config, setConfig] = useState<CotizadorConfig | null>(null);
	const [loading, setLoading] = useState(false);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const methods = useForm<FormData>({
		defaultValues: { label: "", value: "" },
		mode: "onTouched",
	});

	useEffect(() => {
		let mounted = true;
		(async () => {
			setLoading(true);
			try {
				const c = await CotizadorService.getConfig();
				if (mounted) setConfig(c);
			} catch (e: any) {
				setError(e?.message || "No se pudo cargar la configuración.");
			} finally {
				setLoading(false);
			}
		})();
		return () => {
			mounted = false;
		};
	}, []);

	const opciones = config?.SERVICIO_OPCIONES || [];

	const validateLabel = () => {
		const v = (methods.getValues("label") || "").trim();
		if (v.length < 2) {
			methods.setError("label", {
				type: "manual",
				message: "Ingrese un nombre visible",
			});
			return false;
		}
		methods.clearErrors("label");
		return true;
	};

	const validateValue = () => {
		const v = (methods.getValues("value") || "").trim();
		if (v.length < 2) {
			methods.setError("value", {
				type: "manual",
				message: "Debe tener al menos 2 caracteres",
			});
			return false;
		}
		if (!/^[a-z0-9_]+$/.test(v)) {
			methods.setError("value", {
				type: "manual",
				message: "Solo minúsculas, números y guiones bajos (slug)",
			});
			return false;
		}
		methods.clearErrors("value");
		return true;
	};

	const onLabelBlur = () => {
		const { label, value } = methods.getValues();
		if (!value && label) {
			methods.setValue("value", slugify(label), { shouldDirty: true });

			validateValue();
		}
		validateLabel();
	};

	const onSubmit = async (data: FormData) => {
		setSaving(true);
		setError(null);

		const okLabel = validateLabel();
		const okValue = validateValue();
		if (!okLabel || !okValue) {
			setSaving(false);
			return;
		}

		try {
			const next = await CotizadorService.addServicioOpcion({
				label: data.label.trim(),
				value: data.value.trim(),
			});
			setConfig((prev) =>
				prev ? { ...prev, SERVICIO_OPCIONES: next } : (prev as any)
			);
			methods.reset({ label: "", value: "" });
		} catch (e: any) {
			setError(e?.message || "No se pudo guardar la opción.");
		} finally {
			setSaving(false);
		}
	};

	const handleRemove = async (value: string) => {
		if (!confirm("¿Eliminar esta opción?")) return;
		setSaving(true);
		setError(null);
		try {
			const next = await CotizadorService.removeServicioOpcion(value);
			setConfig((prev) =>
				prev ? { ...prev, SERVICIO_OPCIONES: next } : (prev as any)
			);
		} catch (e: any) {
			setError(e?.message || "No se pudo eliminar la opción.");
		} finally {
			setSaving(false);
		}
	};

	return (
		<div className="space-y-8">
			{loading && <div className="text-sm text-gray-500">Cargando…</div>}
			{error && <div className="text-sm text-red-600">{error}</div>}

			<FormProvider {...methods}>
				<form
					onSubmit={methods.handleSubmit(onSubmit)}
					className="space-y-4 rounded-lg border border-gray-200 p-4"
				>
					<h2 className="text-lg font-semibold">Agregar opción</h2>

					<div className="grid sm:grid-cols-2 gap-4">
						<RHFInput
							name="label"
							label="Etiqueta visible"
							placeholder="Ej.: Diseño y supervisión"
							onBlur={onLabelBlur}
							required
							minLength={2}
							autoComplete="off"
						/>
						<RHFInput
							name="value"
							label="Valor (slug)"
							placeholder="Ej.: diseno_supervision"
							onBlur={validateValue}
							required
							minLength={2}
							pattern="^[a-z0-9_]+$"
							autoComplete="off"
						/>
					</div>

					<div className="flex items-center gap-2">
						<Button type="submit" disabled={saving}>
							{saving ? "Guardando…" : "Agregar"}
						</Button>
						<Button
							type="button"
							variant="outline"
							onClick={() => methods.reset({ label: "", value: "" })}
							disabled={saving}
						>
							Limpiar
						</Button>
					</div>
				</form>
			</FormProvider>

			<div className="space-y-3">
				<h2 className="text-lg font-semibold">Opciones actuales</h2>
				<div className="rounded-lg border border-gray-200">
					<div className="grid grid-cols-12 px-4 py-2 text-xs font-medium text-gray-500">
						<div className="col-span-5">Etiqueta</div>
						<div className="col-span-5">Valor</div>
						<div className="col-span-2 text-right">Acciones</div>
					</div>
					<div className="divide-y">
						{opciones.length === 0 && (
							<div className="px-4 py-4 text-sm text-gray-500">
								Sin opciones aún.
							</div>
						)}
						{opciones.map((opt) => (
							<div
								key={opt.value}
								className="grid grid-cols-12 px-4 py-3 items-center"
							>
								<div className="col-span-5 text-sm">{opt.label}</div>
								<div className="col-span-5">
									<code className="text-xs bg-gray-50 px-2 py-1 rounded">
										{opt.value}
									</code>
								</div>
								<div className="col-span-2 flex justify-end">
									<Button
										size="sm"
										variant="outline"
										onClick={() => handleRemove(opt.value)}
										disabled={saving}
									>
										Eliminar
									</Button>
								</div>
							</div>
						))}
					</div>
				</div>

				<p className="text-xs text-gray-500">
					Estas opciones se guardan en el documento{" "}
					<code>cotizador/config</code> dentro de
					<code> SERVICIO_OPCIONES</code>.
				</p>
			</div>
		</div>
	);
}
