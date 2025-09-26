export type AreaMixRow = {
	id: string;
	name: string;
	categoryId?: string;
	notes?: string;

	feeId?: string | null;
	feeName?: string | null;
	feeNameLower?: string | null;

	shares: Record<string, number>;

	createdAt: Date | null;
	updatedAt: Date | null;
};
