export type FeeRange = {
	from: number;
	to: number | null;
	price: number;
};

export type FeeRow = {
	id: string;
	name: string;
	note?: string;
	ranges: FeeRange[];
	createdAt: Date | null;
	updatedAt: Date | null;
};
