export const keyFromCategoria = (l1?: string, l2?: string, l3?: string) =>
	[l1, l2, l3].filter(Boolean).join(":");

export const toNumber = (val: unknown): number => {
	const n = Number(val);
	return Number.isFinite(n) ? n : 0;
};
