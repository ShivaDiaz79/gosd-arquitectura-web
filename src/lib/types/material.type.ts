export type MaterialImage = {
	url: string;
	path: string;
	name?: string;
};

export type MaterialRow = {
	id: string;
	description: string;
	unit: string;
	priceBs: number;
	priceUsd: number;
	stock: number;
	minStock?: number;
	images: MaterialImage[];
	createdAt: Date | null;
	updatedAt: Date | null;
};

export type InventoryMovement = {
	id: string;
	type: "in" | "out" | "adjust";
	qty: number;
	note?: string;
	at: Date | null;
	by?: string;
};
