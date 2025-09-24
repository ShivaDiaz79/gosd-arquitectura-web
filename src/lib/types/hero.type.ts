export type HeroContent = {
	title: string;
	subtitle: string;
	bgUrl: string;
	primaryText: string;
	primaryHref: string;
	secondaryText?: string;
	secondaryHref?: string;
	overlayMode: "light" | "dark";
	overlayOpacity: "10" | "20" | "30" | "40" | "50";
};
