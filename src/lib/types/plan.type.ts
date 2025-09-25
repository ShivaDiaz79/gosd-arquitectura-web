export type PlanRow = {
	id: string;
	name: string;
	price: number;
	note?: string;
	createdAt: Date | null;
	updatedAt: Date | null;
};
