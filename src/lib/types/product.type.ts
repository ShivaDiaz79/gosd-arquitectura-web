export type ProductImage = { url: string; path: string; name?: string };

export type ProductVariant = {
	id: string;
	sku?: string;
	name: string;
	price: number;
	stock: number;
	attributes?: Record<string, string>;
	image?: ProductImage | null;
	active: boolean;
};

export type ProductRow = {
	id: string;
	title: string;
	slug: string;
	description?: string;
	shortDescription?: string;
	categories: string[];
	sku?: string;
	price: number;
	compareAtPrice?: number | null;
	stock: number;
	images: ProductImage[];
	attributes?: Record<string, string[]>;
	hasVariants: boolean;
	variants: ProductVariant[];
	featured: boolean;
	status: "draft" | "published";
	createdAt: Date | null;
	updatedAt: Date | null;
};

export type ProductCategory = {
	id: string;
	name: string;
	slug: string;
	parentId?: string | null;
	description?: string;
	createdAt: Date | null;
	updatedAt: Date | null;
};
