"use client";

import React, { useEffect, useMemo } from "react";
import {
	FormProvider,
	useForm,
	useFormContext,
	useWatch,
} from "react-hook-form";
import RHFInput from "@/components/form/RHFInput";
import RHFSelect from "@/components/form/RHFSelect";
import RHFRadioGroup from "@/components/form/RHFRadioGroup";
import RHFCheckbox from "@/components/form/RHFCheckbox";

type EstadoLead = "nuevo" | "seguimiento" | "confirmado" | "desestimado";
type FuenteContacto = "web" | "recomendacion" | "redes" | "visita";
type Servicio = "diseno" | "construccion";
type ConsultaRapidaKey =
	| "costo_m2"
	| "tipos_proyecto"
	| "financiamiento"
	| "permisos"
	| "obras_visita";

const PROYECTOS = {
	"VIVIENDA UNIFAMILIAR": { label: "VIVIENDA UNIFAMILIAR" },
	"VIVIENDA MULTIFAMILIAR": {
		label: "VIVIENDA MULTIFAMILIAR",
		subs: ["URBANIZACIONES HORIZONTALES", "CONDOMINIOS VERTICALES"],
	},
	URBANIZACIÓN: {
		label: "URBANIZACIÓN",
		subs: ["PARCELAMIENTO", "ANTEPROYECTO URBANÍSTICO", "PROYECTO URBANÍSTICO"],
	},
	HOSPITAL: {
		label: "HOSPITAL",
		subs: [
			"UNIDAD DE SALUD ESPECIALIZADA",
			"CENTRO DE SALUD",
			"HOSPITAL DE 1ER NIVEL",
			"HOSPITAL DE 2DO NIVEL",
			"HOSPITAL DE 3ER NIVEL",
			"FARMACIAS",
			"OTROS",
		],
	},
	GASTRONÓMICO: {
		label: "GASTRONÓMICO",
		subs: [
			"INSTITUTOS GASTRONÓMICOS",
			"LOCALES GASTRONÓMICOS",
			"EDIFICIOS GASTRONOMICOS",
		],
	},
	COMERCIAL: {
		label: "COMERCIAL",
		subs: ["LOCAL COMERCIAL", "EDIFICIO COMERCIAL"],
	},
	INDUSTRIAL: {
		label: "INDUSTRIAL",
		subs: [
			"TINGLADOS, GALPONES, DEPOSITOS",
			"EDIFICIO INDUSTRIAL",
			"CENTRO INDUSTRIAL",
		],
	},
	OFICINAS: {
		label: "OFICINAS",
		subs: ["OFICINA INDIVIDUAL", "EDIFICIO DE OFICINAS"],
	},
	"OBRAS MENORES": {
		label: "OBRAS MENORES",
		subs: ["REFACCIÓN", "AMPLIACIÓN", "ADECUACIÓN", "RESTAURACIÓN"],
	},
	"SUPERVISIÓN, FISCALIZACIÓN O ADMINISTRACIÓN DE OBRAS": {
		label: "SUPERVISIÓN, FISCALIZACIÓN O ADMINISTRACIÓN DE OBRAS",
	},
	LICITACIÓN: { label: "LICITACIÓN" },
} as const;

type CategoriaKey = keyof typeof PROYECTOS;

export interface LeadFormValues {
	nombreCompleto: string;
	telefono?: string;
	email?: string;

	servicio: Servicio;
	categoria: CategoriaKey | "";
	subcategoria?: string;

	presupuesto?: string;

	fuente: FuenteContacto;
	estado: EstadoLead;
	obsQuiereCotizacion: boolean;
	obsTerrenoPropio: boolean;

	responsableSeguimiento: string;
	responsableCierre: string;

	consultaRapida?: ConsultaRapidaKey;
}

const AREAS = [
	{ value: "diseno", label: "DISEÑO" },
	{ value: "construccion", label: "CONSTRUCCIÓN" },
] as const;

const FUENTES = [
	{ value: "web", label: "Web" },
	{ value: "recomendacion", label: "Recomendación" },
	{ value: "redes", label: "Redes" },
	{ value: "visita", label: "Visita" },
] as const;

const ESTADOS = [
	{ value: "nuevo", label: "Nuevo interesado" },
	{ value: "seguimiento", label: "Prospecto de seguimiento" },
	{ value: "confirmado", label: "Cliente confirmado" },
	{ value: "desestimado", label: "Prospecto desestimado" },
] as const;

const RESPONSABLES_SEGUIMIENTO = [
	{ value: "Erwin", label: "Erwin (Ejecutivo comercial)" },
] as const;

const RESPONSABLES_CIERRE = [
	{ value: "Arq. Gonzalo", label: "Arq. Gonzalo (Gerente)" },
] as const;

const CONSULTAS_RAPIDAS = [
	{ value: "costo_m2", label: "¿Cuánto cuesta el m² de construcción?" },
	{ value: "tipos_proyecto", label: "¿Qué tipos de proyectos realizan?" },
	{
		value: "financiamiento",
		label: "¿Trabajan con financiamiento o sólo contado?",
	},
	{ value: "permisos", label: "¿Qué permisos necesito para iniciar la obra?" },
	{
		value: "obras_visita",
		label: "¿Tienen obras en ejecución que pueda visitar?",
	},
] as const;

const FAQ_ANSWERS: Record<ConsultaRapidaKey, string> = {
	costo_m2:
		"El costo por m² varía según el tipo de obra, calidades y complejidad. Podemos darte un rango estimado tras una breve reunión y revisión del alcance.",
	tipos_proyecto:
		"Realizamos diseño y construcción de vivienda (uni/multifamiliar), urbanizaciones, hospitales, gastronómico, comercial, industrial, oficinas, obras menores, supervisión y licitaciones.",
	financiamiento:
		"Trabajamos con pagos por hitos y podemos coordinar opciones; si requieres financiamiento, te orientamos sobre entidades y requisitos.",
	permisos:
		"Depende del municipio y el tipo de obra. Usualmente: uso de suelo, licencia de construcción, planos aprobados y responsabilidad técnica.",
	obras_visita:
		"Sí, podemos coordinar una visita a obras en ejecución o recientemente entregadas, según disponibilidad del cliente y la obra.",
};

const CategoriaSelector: React.FC = () => {
	const { setValue } = useFormContext<LeadFormValues>();
	const categoria = useWatch<LeadFormValues, "categoria">({
		name: "categoria",
	});

	const categoriaOptions = useMemo(
		() =>
			(Object.keys(PROYECTOS) as CategoriaKey[]).map((k) => ({
				value: k,
				label: PROYECTOS[k].label,
			})),
		[]
	);

	const subOptions = useMemo(() => {
		if (!categoria) return [];
		const proyecto = PROYECTOS[categoria];
		const subs =
			"subs" in proyecto && Array.isArray(proyecto.subs)
				? (proyecto.subs as string[])
				: [];
		return subs.map((s: string) => ({ value: s, label: s }));
	}, [categoria]);

	useEffect(() => {
		setValue("subcategoria", "");
	}, [categoria, setValue]);

	return (
		<>
			<RHFSelect
				name="categoria"
				label="Categoría de proyecto"
				placeholder="Selecciona una categoría"
				options={categoriaOptions}
			/>
			<RHFSelect
				name="subcategoria"
				label="Subcategoría (opcional)"
				placeholder={
					subOptions.length
						? "Selecciona una subcategoría"
						: "Sin subcategorías"
				}
				options={subOptions}
				className={subOptions.length ? "" : "opacity-60"}
			/>
		</>
	);
};

const ConsultaRapidaPreview: React.FC = () => {
	const consulta = useWatch<LeadFormValues, "consultaRapida">({
		name: "consultaRapida",
	});
	if (!consulta) return null;
	return (
		<div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-800/40 dark:text-gray-300">
			{FAQ_ANSWERS[consulta]}
		</div>
	);
};

const LeadForm: React.FC<{
	onSubmitLead?: (data: LeadFormValues) => Promise<void> | void;
	defaultValues?: Partial<LeadFormValues>;
}> = ({ onSubmitLead, defaultValues }) => {
	const methods = useForm<LeadFormValues>({
		mode: "onSubmit",
		defaultValues: {
			nombreCompleto: "",
			telefono: "",
			email: "",
			servicio: "diseno",
			categoria: "",
			subcategoria: "",
			presupuesto: "",
			fuente: "web",
			estado: "nuevo",
			obsQuiereCotizacion: false,
			obsTerrenoPropio: false,
			responsableSeguimiento: "Erwin",
			responsableCierre: "Arq. Gonzalo",
			consultaRapida: undefined,
			...defaultValues,
		},
	});

	const {
		handleSubmit,
		setError,
		reset,
		formState: { isSubmitting },
	} = methods;

	useEffect(() => {
		if (defaultValues) {
			reset({
				nombreCompleto: defaultValues.nombreCompleto ?? "",
				telefono: defaultValues.telefono ?? "",
				email: defaultValues.email ?? "",
				servicio: defaultValues.servicio ?? "diseno",
				categoria: defaultValues.categoria ?? "",
				subcategoria: defaultValues.subcategoria ?? "",
				presupuesto: defaultValues.presupuesto ?? "",
				fuente: defaultValues.fuente ?? "web",
				estado: defaultValues.estado ?? "nuevo",
				obsQuiereCotizacion: !!defaultValues.obsQuiereCotizacion,
				obsTerrenoPropio: !!defaultValues.obsTerrenoPropio,
				responsableSeguimiento: defaultValues.responsableSeguimiento ?? "Erwin",
				responsableCierre: defaultValues.responsableCierre ?? "Arq. Gonzalo",
				consultaRapida: defaultValues.consultaRapida,
			});
		}
	}, [defaultValues, reset]);

	const onSubmit = async (values: LeadFormValues) => {
		if (!values.nombreCompleto?.trim()) {
			setError("nombreCompleto", { message: "Ingresa el nombre completo." });
			return;
		}
		if (!values.telefono && !values.email) {
			setError("telefono", { message: "Ingresa teléfono o correo." });
			setError("email", { message: "Ingresa teléfono o correo." });
			return;
		}
		if (!values.categoria) {
			setError("categoria", { message: "Selecciona una categoría." });
			return;
		}

		if (onSubmitLead) {
			await onSubmitLead(values);
		} else {
			console.log("Lead enviado:", values);
			alert("Lead registrado correctamente");
		}

		reset();
	};

	return (
		<FormProvider {...methods}>
			<form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
				<div>
					<h2 className="text-xl font-semibold text-gray-900 dark:text-white">
						Registro de leads
					</h2>
					<p className="text-sm text-gray-500 dark:text-gray-400">
						Captura datos del interesado y su proyecto de interés.
					</p>
				</div>

				<section className="grid grid-cols-1 gap-4 md:grid-cols-2">
					<RHFInput
						name="nombreCompleto"
						label="Nombre completo"
						placeholder="Ej.: María Pérez"
					/>
					<RHFInput
						name="telefono"
						label="Teléfono"
						type="tel"
						placeholder="+591 7xx xx xxx"
					/>
					<RHFInput
						name="email"
						label="Correo electrónico"
						type="email"
						placeholder="correo@dominio.com"
					/>
					<RHFInput
						name="presupuesto"
						label="Presupuesto estimado"
						type="number"
						placeholder="Ej.: 100000"
					/>
				</section>

				<section className="space-y-4">
					<h3 className="text-base font-medium text-gray-900 dark:text-white">
						Proyecto de interés
					</h3>
					<div className="grid grid-cols-1 gap-4">
						<RHFRadioGroup
							name="servicio"
							label="Área"
							options={AREAS.map((a) => ({ value: a.value, label: a.label }))}
						/>
						<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
							<CategoriaSelector />
						</div>
					</div>
				</section>

				<section className="grid grid-cols-1 gap-4 md:grid-cols-3">
					<RHFSelect
						name="fuente"
						label="Fuente del contacto"
						placeholder="Selecciona una opción"
						options={FUENTES as unknown as { value: string; label: string }[]}
					/>
					<div className="md:col-span-2">
						<RHFRadioGroup
							name="estado"
							label="Estado del lead"
							options={ESTADOS as unknown as { value: string; label: string }[]}
							inline
						/>
					</div>
					<div className="col-span-1 md:col-span-3">
						<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
							<RHFCheckbox
								name="obsQuiereCotizacion"
								label="Quiere cotización"
							/>
							<RHFCheckbox name="obsTerrenoPropio" label="Terreno propio" />
						</div>
					</div>
				</section>

				<section className="grid grid-cols-1 gap-4 md:grid-cols-2">
					<RHFSelect
						name="responsableSeguimiento"
						label="Responsable de seguimiento"
						options={
							RESPONSABLES_SEGUIMIENTO as unknown as {
								value: string;
								label: string;
							}[]
						}
						placeholder="Selecciona responsable"
					/>
					<RHFSelect
						name="responsableCierre"
						label="Responsable del cierre"
						options={
							RESPONSABLES_CIERRE as unknown as {
								value: string;
								label: string;
							}[]
						}
						placeholder="Selecciona responsable"
					/>
				</section>

				<section className="space-y-3">
					<h3 className="text-base font-medium text-gray-900 dark:text-white">
						Consultas rápidas
					</h3>
					<RHFSelect
						name="consultaRapida"
						placeholder="Selecciona una consulta para responder al cliente"
						options={
							CONSULTAS_RAPIDAS as unknown as { value: string; label: string }[]
						}
					/>
					<ConsultaRapidaPreview />
				</section>

				<div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
					<button
						type="reset"
						className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
					>
						Limpiar
					</button>
					<button
						type="submit"
						disabled={isSubmitting}
						className="rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
					>
						{isSubmitting ? "Guardando..." : "Guardar lead"}
					</button>
				</div>
			</form>
		</FormProvider>
	);
};

export default LeadForm;
