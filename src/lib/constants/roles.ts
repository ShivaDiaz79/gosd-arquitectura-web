import { RoleKey } from "@/lib/types/role-key.type";

export const ROLES: {
	value: RoleKey;
	label: string;
}[] = [
	{
		value: "project_manager",
		label: "Gerente de proyectos / Director de obra",
	},
	{ value: "sales", label: "Equipo de ventas / Comercial" },
	{ value: "technical", label: "Área técnica / Ingenieros - Arquitectos" },
	{ value: "admin_finance", label: "Área administrativa / Finanzas" },
	{ value: "legal", label: "Legal" },
	{ value: "client", label: "Cliente (rol externo, opcional)" },
];
