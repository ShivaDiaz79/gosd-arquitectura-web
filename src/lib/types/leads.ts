/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Timestamp } from "firebase/firestore";

export type EstadoLead = "nuevo" | "seguimiento" | "confirmado" | "desestimado";
export type FuenteContacto = "web" | "recomendacion" | "redes" | "visita";
export type Servicio = "diseno" | "construccion";

export type CategoriaKey =
	| "VIVIENDA UNIFAMILIAR"
	| "VIVIENDA MULTIFAMILIAR"
	| "URBANIZACIÓN"
	| "HOSPITAL"
	| "GASTRONÓMICO"
	| "COMERCIAL"
	| "INDUSTRIAL"
	| "OFICINAS"
	| "OBRAS MENORES"
	| "SUPERVISIÓN, FISCALIZACIÓN O ADMINISTRACIÓN DE OBRAS"
	| "LICITACIÓN";

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

	consultaRapida?: string;
}

export interface LeadDoc extends LeadFormValues {
	id: string;
	createdAt: Timestamp | null;
	updatedAt: Timestamp | null;
	deletedAt: Timestamp | null;
}

export type ListParams = {
	pageSize?: number;
	cursor?: any | null;
	includeDeleted?: boolean;
	estado?: EstadoLead;
	servicio?: Servicio;
	fuente?: FuenteContacto;
	searchPrefix?: string;
	orderByField?: "createdAt" | "nombreCompleto";
	orderDir?: "asc" | "desc";
};

export type ListResult = {
	items: LeadDoc[];
	nextCursor: any | null;
	total?: number;
};
