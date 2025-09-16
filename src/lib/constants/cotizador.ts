export const SERVICIO_OPCIONES = [
	{ value: "diseno", label: "Diseño" },
	{ value: "construccion", label: "Construcción" },
	{ value: "diseno_construccion", label: "Diseño y Construcción" },
];

export const CATEGORIA_L1 = [
	{ value: "vivienda_unifamiliar", label: "Vivienda Unifamiliar" },
	{ value: "vivienda_multifamiliar", label: "Vivienda Multifamiliar" },
	{ value: "urbanizacion", label: "Urbanización" },
	{ value: "hospital", label: "Hospital" },
	{ value: "gastronomico", label: "Gastronómico" },
	{ value: "comercial", label: "Comercial" },
	{ value: "industrial", label: "Industrial" },
	{ value: "oficinas", label: "Oficinas" },
	{ value: "obras_menores", label: "Obras Menores" },
] as const;

export const CATEGORIA_L2: Record<string, { value: string; label: string }[]> =
	{
		vivienda_unifamiliar: [],

		vivienda_multifamiliar: [
			{
				value: "urbanizaciones_horizontales",
				label: "Urbanizaciones Horizontales",
			},
			{ value: "condominios_verticales", label: "Condominios Verticales" },
		],

		urbanizacion: [
			{ value: "parcelamiento", label: "Parcelamiento" },
			{ value: "anteproyecto_urbanistico", label: "Anteproyecto Urbanístico" },
			{ value: "proyecto_urbanistico", label: "Proyecto Urbanístico" },
		],

		hospital: [
			{
				value: "unidad_salud_especializada",
				label: "Unidad de Salud Especializada",
			},
			{ value: "centro_salud", label: "Centro de Salud" },
			{ value: "hospital_1er_nivel", label: "Hospital de 1er Nivel" },
			{ value: "hospital_2do_nivel", label: "Hospital de 2do Nivel" },
			{ value: "hospital_3er_nivel", label: "Hospital de 3er Nivel" },
			{ value: "farmacias", label: "Farmacias" },
			{ value: "otros", label: "Otros" },
		],

		gastronomico: [
			{ value: "institutos_gastronomicos", label: "Institutos Gastronómicos" },
			{ value: "locales_gastronomicos", label: "Locales Gastronómicos" },
			{ value: "edificios_gastronomicos", label: "Edificios Gastronómicos" },
		],

		comercial: [
			{ value: "local_comercial", label: "Local Comercial" },
			{ value: "edificio_comercial", label: "Edificio Comercial" },
		],

		industrial: [
			{
				value: "tinglados_galpones_depositos",
				label: "Tinglados, Galpones, Depósitos",
			},
			{ value: "edificio_industrial", label: "Edificio Industrial" },
			{ value: "centro_industrial", label: "Centro Industrial" },
		],

		oficinas: [
			{ value: "oficina_individual", label: "Oficina Individual" },
			{ value: "edificio_de_oficinas", label: "Edificio de Oficinas" },
		],

		obras_menores: [
			{ value: "refaccion", label: "Refacción" },
			{ value: "ampliacion", label: "Ampliación" },
			{ value: "adecuacion", label: "Adecuación" },
			{ value: "restauracion", label: "Restauración" },
		],
	};

export const CATEGORIA_L3: Record<string, { value: string; label: string }[]> =
	{};

export const ENTREGABLES_DISENO = [
	{ value: "arquitectura", text: "Arquitectura" },
	{ value: "estructuras", text: "Estructuras" },
	{ value: "hidrosanitarias", text: "Instalaciones Hidrosanitarias" },
	{ value: "electricas_bt", text: "Inst. Eléctricas — Baja Tensión" },
	{ value: "electricas_mt", text: "Inst. Eléctricas — Media Tensión" },
	{ value: "electricas_at", text: "Inst. Eléctricas — Alta Tensión" },
	{ value: "gas_dom", text: "Inst. de Gas — Domiciliario" },
	{ value: "gas_com", text: "Inst. de Gas — Comercial" },
	{ value: "gas_ind", text: "Inst. de Gas — Industrial" },
	{ value: "gas_hosp", text: "Inst. de Gas — Hospitalario" },
	{ value: "red_seguridad", text: "Red/Voz/Datos — Sistemas de Seguridad" },
	{ value: "red_telefonia", text: "Red/Voz/Datos — Red y Telefonía" },
	{
		value: "red_comunicacion",
		text: "Red/Voz/Datos — Sistemas de Comunicación",
	},
	{ value: "red_sonido", text: "Red/Voz/Datos — Sistemas de Sonido" },
	{
		value: "ambiental_licencia",
		text: "Ingeniería Ambiental — Licencia Ambiental",
	},
	{ value: "ambiental_ficha", text: "Ingeniería Ambiental — Ficha Ambiental" },
	{ value: "perm_caa", text: "Permisos — Visado Colegio de Arquitectos" },
	{ value: "perm_sib", text: "Permisos — Visado Sociedad de Ingenieros" },
	{
		value: "perm_aprob_anteproyecto",
		text: "Permisos — Aprobación de Anteproyecto",
	},
	{ value: "perm_aprob_proyecto", text: "Permisos — Aprobación de Proyecto" },
	{ value: "perm_licencia_ambiental", text: "Permisos — Licencia Ambiental" },
	{
		value: "perm_licencia_construccion",
		text: "Permisos — Licencia de Construcción",
	},
	{
		value: "perm_indiv_terrenos",
		text: "Permisos — Individualización de Terrenos",
	},
	{
		value: "perm_indiv_viviendas",
		text: "Permisos — Individualización de Viviendas",
	},
	{ value: "perm_cert_habitese", text: "Permisos — Certificado de Habitese" },
];

export const EJECUTABLES_CONSTRUCCION = [
	{
		value: "estudios_preliminares_suelos",
		text: "Estudios Preliminares — Estudio de Suelos",
	},
	{
		value: "estudios_preliminares_analisis_sitio",
		text: "Estudios Preliminares — Análisis del Sitio",
	},
	{
		value: "obras_preliminares_menores",
		text: "Obras Preliminares — 0 a 299 m²",
	},
	{
		value: "obras_preliminares_medianas",
		text: "Obras Preliminares — 300 a 600 m²",
	},
	{
		value: "obras_preliminares_mayores",
		text: "Obras Preliminares — 601 a 1499 m²",
	},
	{
		value: "obras_preliminares_especiales",
		text: "Obras Preliminares — 1500 m² en adelante",
	},
	{ value: "fundaciones", text: "Fundaciones" },
	{ value: "hormigones", text: "Hormigones" },
	{ value: "mamposterias", text: "Mamposterías" },
	{ value: "cubiertas_losas", text: "Cubiertas — Losas" },
	{ value: "cubiertas_tejas", text: "Cubiertas — Tejas" },
	{ value: "cubiertas_calaminas", text: "Cubiertas — Calaminas" },
	{ value: "cubiertas_cementicias", text: "Cubiertas — Cementicias Onduladas" },
	{ value: "acabados_pisos", text: "Acabados — Pisos" },
	{ value: "acabados_revestimientos", text: "Acabados — Revestimientos" },
	{ value: "acabados_mesones", text: "Acabados — Mesones" },
	{ value: "carp_madera", text: "Carpinterías — Madera" },
	{ value: "carp_vidrio", text: "Carpinterías — Vidrio" },
	{ value: "carp_metalicos", text: "Carpinterías — Metálicos" },
	{ value: "artefactos_griferias", text: "Artefactos — Griferías" },
	{ value: "artefactos_sanitarios", text: "Artefactos — Sanitarios" },
	{ value: "artefactos_iluminacion", text: "Artefactos — Iluminación" },
	{ value: "artefactos_kits_banos", text: "Artefactos — Kits de Baños" },
	{ value: "artefactos_kits_cocina", text: "Artefactos — Kits de Cocina" },
	{ value: "mobiliario_roperos", text: "Mobiliario — Roperos" },
	{ value: "mobiliario_armarios", text: "Mobiliario — Armarios" },
	{ value: "mobiliario_vestidores", text: "Mobiliario — Vestidores" },
	{ value: "mobiliario_cocina", text: "Mobiliario — Cocina" },
	{ value: "mobiliario_banos", text: "Mobiliario — Baños" },
	{ value: "mobiliario_ropa_blanca", text: "Mobiliario — Ropa Blanca" },
	{ value: "equip_aa", text: "Equipamiento — Aires Acondicionados" },
	{ value: "equip_extractores", text: "Equipamiento — Extractores" },
	{ value: "equip_encimeras", text: "Equipamiento — Encimeras" },
	{ value: "equip_hornos", text: "Equipamiento — Hornos" },
	{ value: "equip_heladera", text: "Equipamiento — Heladera" },
	{ value: "equip_microondas", text: "Equipamiento — Microondas" },
	{
		value: "equip_cortinas_conv",
		text: "Equipamiento — Cortinas Convencionales",
	},
	{
		value: "equip_cortinas_auto",
		text: "Equipamiento — Cortinas Automatizadas",
	},
	{
		value: "equip_intercom_video",
		text: "Equipamiento — Intercom. c/ Video Portero",
	},
	{
		value: "equip_intercom_estandar",
		text: "Equipamiento — Intercom. Estándar",
	},
	{ value: "seg_camaras", text: "Sistemas de Seguridad — Cámaras" },
	{ value: "seg_racks", text: "Sistemas de Seguridad — Racks" },
	{ value: "seg_dvr", text: "Sistemas de Seguridad — DVR (Grabador)" },
	{
		value: "automatizacion_smarthome",
		text: "Sistemas de Automatización — SmartHome",
	},
	{
		value: "automatizacion_inmotica",
		text: "Sistemas de Automatización — Inmótica",
	},
	{ value: "otros", text: "OTROS (revisión de supervisor)" },
];

export const COSTOS_M2: Record<
	string,
	{ diseno?: number; construccion?: number }
> = {
	vivienda_unifamiliar: { diseno: 0, construccion: 0 },
	"vivienda_multifamiliar:urbanizaciones_horizontales": {
		diseno: 0,
		construccion: 0,
	},
	"vivienda_multifamiliar:condominios_verticales": {
		diseno: 0,
		construccion: 0,
	},
	"urbanizacion:parcelamiento": { diseno: 0, construccion: 0 },
	"urbanizacion:anteproyecto_urbanistico": { diseno: 0, construccion: 0 },
	"urbanizacion:proyecto_urbanistico": { diseno: 0, construccion: 0 },
	"hospital:unidad_salud_especializada": { diseno: 0, construccion: 0 },
	"hospital:centro_salud": { diseno: 0, construccion: 0 },
	"hospital:hospital_1er_nivel": { diseno: 0, construccion: 0 },
	"hospital:hospital_2do_nivel": { diseno: 0, construccion: 0 },
	"hospital:hospital_3er_nivel": { diseno: 0, construccion: 0 },
	"hospital:farmacias": { diseno: 0, construccion: 0 },
	"hospital:otros": { diseno: 0, construccion: 0 },
	"gastronomico:institutos_gastronomicos": { diseno: 0, construccion: 0 },
	"gastronomico:locales_gastronomicos": { diseno: 0, construccion: 0 },
	"gastronomico:edificios_gastronomicos": { diseno: 0, construccion: 0 },
	"comercial:local_comercial": { diseno: 0, construccion: 0 },
	"comercial:edificio_comercial": { diseno: 0, construccion: 0 },
	"industrial:tinglados_galpones_depositos": { diseno: 0, construccion: 0 },
	"industrial:edificio_industrial": { diseno: 0, construccion: 0 },
	"industrial:centro_industrial": { diseno: 0, construccion: 0 },
	"oficinas:oficina_individual": { diseno: 0, construccion: 0 },
	"oficinas:edificio_de_oficinas": { diseno: 0, construccion: 0 },
	"obras_menores:refaccion": { diseno: 0, construccion: 0 },
	"obras_menores:ampliacion": { diseno: 0, construccion: 0 },
	"obras_menores:adecuacion": { diseno: 0, construccion: 0 },
	"obras_menores:restauracion": { diseno: 0, construccion: 0 },
};

export const TARIFAS_ENTREGABLES_M2: Record<string, number> = {};

export const TARIFAS_EJECUTABLES_M2: Record<string, number> = {};
