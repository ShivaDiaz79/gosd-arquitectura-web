"use client";

import { FormProvider, useForm } from "react-hook-form";
import RHFInput from "@/components/form/RHFInput";
import RHFSelect, { Option } from "@/components/form/RHFSelect";
import RHFRadioGroup from "@/components/form/RHFRadioGroup";
import { useParallaxContent } from "@/hooks/useParallaxContent";
import type { ParallaxContent } from "@/lib/types/parallax.type";
import { useEffect, useState } from "react";

type FormValues = ParallaxContent & {
	__note?: string;
};

const opacityOptions: Option[] = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50].map(
	(n) => ({
		value: String(n),
		label: `${n}%`,
	})
);

export default function ParallaxBandForm() {
	const { data, loading, saving, error, save, reload } = useParallaxContent();

	const methods = useForm<FormValues>({
		defaultValues: {
			title: "",
			subtitle: "",
			bgUrl: "",
			bgOpacity: 25,
			videoUrl: "",
			posterUrl: "",
			parallaxY: 120,
			scaleVideo: 1.06,
			__note: "prefers-reduced-motion",
		},

		shouldUnregister: true,
	});

	useEffect(() => {
		if (!loading && data)
			methods.reset({ ...data, __note: "prefers-reduced-motion" });
	}, [loading, data, methods]);

	const [msg, setMsg] = useState<string | null>(null);

	const onSubmit = methods.handleSubmit(async (vals) => {
		setMsg(null);
		try {
			const { __note: _ignore, ...rest } = vals;

			const payload: ParallaxContent = {
				...rest,
				bgOpacity: Number(rest.bgOpacity ?? 25),
				parallaxY: Number(rest.parallaxY ?? 120),
				scaleVideo: Number(rest.scaleVideo ?? 1.06),
			};

			await save(payload);
			setMsg("Guardado con éxito.");
		} catch {
			setMsg("Error al guardar. Revisá la consola.");
		}
	});

	return (
		<FormProvider {...methods}>
			<form onSubmit={onSubmit} className="grid grid-cols-1 gap-6 max-w-4xl">
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<RHFInput
						name="title"
						label="Título"
						placeholder="Proceso y coordinación en obra"
					/>
					<RHFInput
						name="subtitle"
						label="Subtítulo"
						placeholder="Gestión, control, planificación…"
					/>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<RHFInput
						name="bgUrl"
						label="Imagen de fondo (URL)"
						placeholder="https://…"
					/>
					<RHFSelect
						name="bgOpacity"
						label="Opacidad del fondo"
						options={opacityOptions}
						placeholder="25%"
						className="w-full"
					/>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					<RHFInput
						name="videoUrl"
						label="Video (URL)"
						placeholder="/media/site_walkthrough.mp4"
					/>
					<RHFInput
						name="posterUrl"
						label="Poster (URL)"
						placeholder="/images/poster.jpg"
					/>
					<RHFInput
						name="parallaxY"
						type="number"
						step="1"
						label="Parallax Y (px)"
						placeholder="120"
					/>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					<RHFInput
						name="scaleVideo"
						type="number"
						step="0.01"
						label="Escala video (1–1.3)"
						placeholder="1.06"
					/>

					<RHFRadioGroup
						name="__note"
						label="Accesibilidad (informativo)"
						options={[
							{
								value: "prefers-reduced-motion",
								label: "Respeta reduced-motion del sistema",
							},
						]}
						inline
						className="opacity-60"
					/>
				</div>

				<div className="flex items-center gap-3">
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
