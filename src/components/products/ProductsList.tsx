"use client";

import { useEffect, useMemo, useState } from "react";
import { QueryDocumentSnapshot, DocumentData } from "firebase/firestore";
import {
	Table,
	TableHeader,
	TableBody,
	TableRow,
	TableCell,
} from "@/components/ui/table";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import ProductForm from "./ProductForm";
import { ProductsService } from "@/services/ProductsService";
import type { ProductRow, ProductCategory } from "@/lib/types/product.type";

function fDate(d?: Date | null) {
	if (!d) return "—";
	try {
		return d.toLocaleDateString("es-ES", {
			year: "numeric",
			month: "short",
			day: "2-digit",
		});
	} catch {
		return "—";
	}
}

export default function ProductsList({
	pageSize = 10,
	categories,
}: {
	pageSize?: number;
	categories: ProductCategory[];
}) {
	const [page, setPage] = useState(0);
	const [products, setProducts] = useState<ProductRow[]>([]);
	const [cursors, setCursors] = useState<QueryDocumentSnapshot<DocumentData>[]>(
		[]
	);
	const [hasNext, setHasNext] = useState(false);
	const [loading, setLoading] = useState(true);
	const [search, setSearch] = useState("");
	const [editingId, setEditingId] = useState<string | null>(null);
	const [del, setDel] = useState<ProductRow | null>(null);
	const [openCreate, setOpenCreate] = useState(false);

	useEffect(() => {
		setLoading(true);
		const after = page > 0 ? cursors[page - 1] : undefined;
		const unsub = ProductsService.listenPage({
			pageSize,
			after,
			onResult: ({ products, lastDoc, hasNext }) => {
				setProducts(products);
				setHasNext(hasNext);
				if (lastDoc)
					setCursors((prev) => {
						const c = [...prev];
						c[page] = lastDoc;
						return c;
					});
				setLoading(false);
			},
			onError: () => setLoading(false),
		});
		return () => unsub();
	}, [page, pageSize]);

	const filtered = useMemo(() => {
		const q = search.trim().toLowerCase();
		if (!q) return products;
		return products.filter((p) =>
			[p.title, p.description].join(" ").toLowerCase().includes(q)
		);
	}, [products, search]);

	return (
		<div className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 dark:bg-gray-900">
			<div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<h2 className="text-base font-semibold">Productos</h2>
				<div className="flex w-full items-center gap-2 sm:w-auto">
					<div className="relative w-full sm:w-72">
						<input
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							placeholder="Buscar por nombre o descripción…"
							className="w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-3 py-2 text-sm outline-none ring-indigo-500 focus:ring-2"
						/>
						<svg
							className="pointer-events-none absolute left-3 top-2.5 h-5 w-5 text-slate-400"
							viewBox="0 0 24 24"
							fill="currentColor"
						>
							<path d="M10 4a6 6 0 104.47 10.03l4.4 4.4a1 1 0 001.42-1.42l-4.4-4.4A6 6 0 0010 4zm0 2a4 4 0 110 8 4 4 0 010-8z" />
						</svg>
					</div>
					<button
						onClick={() => setOpenCreate(true)}
						className="rounded-md bg-black px-4 py-2 text-sm text-white hover:opacity-90"
					>
						Nuevo
					</button>
				</div>
			</div>

			<div className="overflow-x-auto">
				<Table className="divide-y divide-slate-200">
					<TableHeader>
						<TableRow>
							<TableCell
								isHeader
								className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500"
							>
								Producto
							</TableCell>
							<TableCell
								isHeader
								className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500"
							>
								Precio
							</TableCell>
							<TableCell
								isHeader
								className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500"
							>
								Stock
							</TableCell>
							<TableCell
								isHeader
								className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500"
							>
								Estado
							</TableCell>
							<TableCell
								isHeader
								className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500"
							>
								Creado
							</TableCell>
							<TableCell
								isHeader
								className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500"
							>
								Acciones
							</TableCell>
						</TableRow>
					</TableHeader>

					<TableBody className="divide-y divide-slate-100">
						{loading ? (
							Array.from({ length: 5 }).map((_, i) => (
								<TableRow key={i} className="animate-pulse">
									<TableCell className="px-4 py-4">
										<div className="h-4 w-64 rounded bg-slate-200" />
									</TableCell>
									<TableCell className="px-4 py-4">
										<div className="h-4 w-20 rounded bg-slate-200" />
									</TableCell>
									<TableCell className="px-4 py-4">
										<div className="h-4 w-12 rounded bg-slate-200" />
									</TableCell>
									<TableCell className="px-4 py-4">
										<div className="h-4 w-16 rounded bg-slate-200" />
									</TableCell>
									<TableCell className="px-4 py-4">
										<div className="h-4 w-24 rounded bg-slate-200" />
									</TableCell>
									<TableCell className="px-4 py-4">
										<div className="h-8 w-24 rounded bg-slate-200" />
									</TableCell>
								</TableRow>
							))
						) : filtered.length === 0 ? (
							<TableRow>
								<TableCell
									className="px-4 py-6 text-sm text-slate-500"
									colSpan={6}
								>
									No hay productos.
								</TableCell>
							</TableRow>
						) : (
							filtered.map((p) => (
								<TableRow key={p.id} className="hover:bg-slate-50">
									<TableCell className="px-4 py-3">
										<div className="flex items-center gap-3">
											<div className="h-10 w-16 overflow-hidden rounded border bg-slate-100">
												{p.images?.[0]?.url && (
													<img
														src={p.images[0].url}
														alt={p.title}
														className="h-full w-full object-cover"
													/>
												)}
											</div>
											<div>
												<div className="text-sm font-medium">{p.title}</div>
												<div className="text-xs text-slate-500">{p.slug}</div>
											</div>
										</div>
									</TableCell>
									<TableCell className="px-4 py-3">
										<div className="text-sm">
											{p.compareAtPrice ? (
												<span className="mr-2 line-through opacity-60">
													${p.compareAtPrice.toFixed(2)}
												</span>
											) : null}
											<span className="font-medium">${p.price.toFixed(2)}</span>
										</div>
									</TableCell>
									<TableCell className="px-4 py-3">
										<span className="text-sm">
											{p.hasVariants ? "—" : p.stock}
										</span>
									</TableCell>
									<TableCell className="px-4 py-3">
										<span className="text-xs rounded px-2 py-0.5 ring-1 ring-slate-200">
											{p.status === "published" ? "Publicado" : "Borrador"}
										</span>
									</TableCell>
									<TableCell className="px-4 py-3">
										<div className="text-sm">{fDate(p.createdAt)}</div>
									</TableCell>
									<TableCell className="px-4 py-3">
										<div className="flex items-center gap-2">
											<button
												onClick={() => setEditingId(p.id)}
												className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs"
											>
												Editar
											</button>
											<button
												onClick={() => setDel(p)}
												className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs text-rose-700"
											>
												Eliminar
											</button>
										</div>
									</TableCell>
								</TableRow>
							))
						)}
					</TableBody>
				</Table>
			</div>

			<div className="mt-4 flex items-center justify-between">
				<div className="text-xs text-slate-500">
					Página <span className="font-medium">{page + 1}</span>
				</div>
				<div className="flex items-center gap-2">
					<button
						onClick={() => setPage((p) => Math.max(0, p - 1))}
						disabled={page === 0}
						className="rounded-xl border px-3 py-1.5 text-xs"
					>
						Anterior
					</button>
					<button
						onClick={() => hasNext && setPage((p) => p + 1)}
						disabled={!hasNext}
						className="rounded-xl border px-3 py-1.5 text-xs"
					>
						Siguiente
					</button>
				</div>
			</div>

			{editingId && (
				<Modal
					isOpen={!!editingId}
					onClose={() => setEditingId(null)}
					className="max-w-5xl p-6 sm:p-8"
				>
					<h3 className="mb-2 text-lg font-semibold">Editar producto</h3>
					<ProductForm
						product={products.find((x) => x.id === editingId)!}
						categories={categories}
						onSaved={() => setEditingId(null)}
					/>
					<div className="mt-6 flex items-center justify-end">
						<Button variant="outline" onClick={() => setEditingId(null)}>
							Cerrar
						</Button>
					</div>
				</Modal>
			)}

			{del && (
				<Modal
					isOpen={!!del}
					onClose={() => setDel(null)}
					className="max-w-md p-6 sm:p-8"
				>
					<h3 className="mb-2 text-lg font-semibold">Eliminar producto</h3>
					<p className="mb-5 text-sm text-gray-500">
						Esta acción es permanente para{" "}
						<span className="font-semibold">{del.title}</span>.
					</p>
					<div className="flex items-center justify-end gap-2">
						<Button variant="outline" onClick={() => setDel(null)}>
							Cancelar
						</Button>
						<Button
							className="!bg-rose-600 hover:!bg-rose-500"
							onClick={async () => {
								await ProductsService.remove(del.id);
								setDel(null);
							}}
						>
							Eliminar
						</Button>
					</div>
				</Modal>
			)}

			<Modal
				isOpen={openCreate}
				onClose={() => setOpenCreate(false)}
				className="max-w-5xl p-6 sm:p-8"
			>
				<h3 className="mb-2 text-lg font-semibold">Nuevo producto</h3>
				<ProductForm
					categories={categories}
					onSaved={() => setOpenCreate(false)}
				/>
			</Modal>
		</div>
	);
}
