"use client";

import { FormProvider, useForm, useFormContext } from "react-hook-form";
import RHFInput from "@/components/form/RHFInput";
import RHFFileInput from "@/components/form/RHFFileInput";
import RHFSelect, { Option } from "@/components/form/RHFSelect";
import RHFRadioGroup from "@/components/form/RHFRadioGroup";
import { useHeroContent } from "@/hooks/useHeroContent";
import type { HeroContent } from "@/lib/types/hero.type";
import { useEffect, useMemo, useState } from "react";

type FormValues = HeroContent & { bgFile: File | null };

const overlayOptions: Option[] = [
	{ value: "10", label: "10%" },
	{ value: "20", label: "20%" },
	{ value: "30", label: "30%" },
	{ value: "40", label: "40%" },
	{ value: "50", label: "50%" },
];

const modeOptions = [
	{ value: "dark", label: "Oscuro" },
	{ value: "light", label: "Claro" },
];

export default function HeroForm() {
	const { data, loading, saving, error, save, reload } = useHeroContent();
	const methods = useForm<FormValues>({
		defaultValues: {
			title: "",
			subtitle: "",
			bgUrl: "",
			primaryText: "",
			primaryHref: "",
			secondaryText: "",
			secondaryHref: "",
			overlayMode: "dark",
			overlayOpacity: "40",
			bgFile: null,
		},
	});

	const [msg, setMsg] = useState<string | null>(null);

	useEffect(() => {
		if (!loading && data) {
			methods.reset({
				...data,
				bgFile: null,
			});
		}
	}, [loading, data, methods]);

	const onSubmit = methods.handleSubmit(async (vals) => {
		setMsg(null);
		try {
			const saved = await save(vals);
			setMsg("Guardado con éxito.");
		} catch (e: any) {
			setMsg("Error al guardar. Revisa la consola.");
		}
	});

	return (
		<FormProvider {...methods}>
			<form
				onSubmit={onSubmit}
				className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl"
			>
				<div className="space-y-4">
					<RHFInput
						name="title"
						label="Título"
						placeholder="GOSD CONSTRUCTOR"
					/>
					<RHFInput
						name="subtitle"
						label="Subtítulo"
						placeholder="Descripción breve"
					/>

					<RHFRadioGroup
						name="overlayMode"
						label="Superposición"
						options={modeOptions}
						inline
					/>

					<RHFSelect
						name="overlayOpacity"
						label="Opacidad del overlay"
						options={overlayOptions}
						placeholder="Selecciona opacidad"
						className="w-full"
					/>

					<div className="grid grid-cols-2 gap-4">
						<RHFInput
							name="primaryText"
							label="Botón 1 - Texto"
							placeholder="Ver obras"
						/>
						<RHFInput
							name="primaryHref"
							label="Botón 1 - Link"
							placeholder="/obras"
						/>
					</div>

					<div className="grid grid-cols-2 gap-4">
						<RHFInput
							name="secondaryText"
							label="Botón 2 - Texto"
							placeholder="Solicitar presupuesto"
						/>
						<RHFInput
							name="secondaryHref"
							label="Botón 2 - Link"
							placeholder="/contacto"
						/>
					</div>
				</div>

				<div className="space-y-4">
					<RHFInput
						name="bgUrl"
						label="URL de imagen de fondo"
						placeholder="https://…"
					/>
					<RHFFileInput name="bgFile" label="o subir nueva imagen" />
					<p className="text-xs text-gray-500">
						Si subís una imagen nueva, reemplazará la URL al guardar.
					</p>

					<div className="rounded-lg border border-gray-200 dark:border-white/10 overflow-hidden">
						<div className="bg-gray-50 dark:bg-white/5 px-3 py-2 text-sm font-medium">
							Vista previa
						</div>
						<div className="p-3">
							<Preview />
						</div>
					</div>
				</div>

				<div className="md:col-span-2 flex items-center gap-3">
					<button
						type="submit"
						disabled={saving}
						className="inline-flex items-center rounded-md px-5 py-2.5 text-sm bg-black text-white hover:opacity-90 disabled:opacity-60"
					>
						{saving ? "Guardando…" : "Guardar cambios"}
					</button>
					<button
						type="button"
						onClick={() => reload()}
						className="inline-flex items-center rounded-md px-5 py-2.5 text-sm border border-black/15 hover:bg-black/5"
					>
						Recargar
					</button>
					{error && <span className="text-sm text-red-600">{error}</span>}
					{msg && <span className="text-sm text-green-600">{msg}</span>}
				</div>
			</form>
		</FormProvider>
	);
}

function Preview() {
	const { watch } = useFormContext<FormValues>();
	const bgUrl = watch("bgUrl");
	const title = watch("title");
	const subtitle = watch("subtitle");
	return (
		<div className="relative w-full aspect-[16/9] rounded-md overflow-hidden border border-black/10">
			<img
				src={bgUrl || "https://placehold.co/1200x675?text=Fondo+Hero"}
				alt=""
				className="absolute inset-0 h-full w-full object-cover"
			/>

			<div className="absolute inset-0 bg-black/25" />
			<div className="relative z-10 h-full p-4 flex items-end">
				<div>
					<div className="text-white text-lg font-semibold">
						{title || "Título"}
					</div>
					<div className="text-white/90 text-sm">{subtitle || "Subtítulo"}</div>
				</div>
			</div>
		</div>
	);
}
