"use client";
import ProductsList from "@/components/products/ProductsList";

export default function ProductsPage() {
	return (
		<div className="max-w-6xl">
			<h1 className="mb-4 text-xl font-semibold">Productos</h1>
			<ProductsList categories={[]} pageSize={10} />
		</div>
	);
}
