export type LaborRow = {
	id: string;
	name: string;
	category?: string;
	unit: "hora" | "día";
	hoursPerDay?: number;
	rateBs: number;
	rateUsd: number;
	createdAt: Date | null;
	updatedAt: Date | null;
};
