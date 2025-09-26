export type Currency = "BOB" | "USD";
export function formatMoney(value: number, currency: Currency) {
	return new Intl.NumberFormat("es-BO", {
		style: "currency",
		currency: currency === "BOB" ? "BOB" : "USD",
		maximumFractionDigits: 2,
	}).format(value || 0);
}
