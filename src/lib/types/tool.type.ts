export type ToolImage = {
	url: string;
	path: string;
	name?: string;
};

export type ToolRow = {
	id: string;
	name: string;
	code?: string;
	category?: string;
	unit: string;
	stock: number;
	minStock?: number;
	location?: string;
	images: ToolImage[];
	createdAt: Date | null;
	updatedAt: Date | null;
};

export type ToolMovement = {
	id: string;
	type: "in" | "out" | "adjust" | "issue" | "return";
	qty: number;
	note?: string;
	to?: string;
	at: Date | null;
	by?: string;
};
