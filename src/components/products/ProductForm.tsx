"use client";

import {
	FormProvider,
	useForm,
	useFieldArray,
	useWatch,
} from "react-hook-form";
import RHFInput from "@/components/form/RHFInput";
import RHFFileInput from "@/components/form/RHFFileInput";
import Button from "@/components/ui/button/Button";
import type {
	ProductRow,
	ProductImage,
	ProductVariant,
	ProductCategory,
} from "@/lib/types/product.type";
import { ProductsService } from "@/services/ProductsService";
import { useEffect, useMemo, useState } from "react";

type FormValues = {
	title: string;
	slug: string;
	description?: string;
	shortDescription?: string;
	categories: string[];
	sku?: string;
	price: number;
	compareAtPrice?: number | null;
	stock: number;
	featured: boolean;
	status: "draft" | "published";
	hasVariants: boolean;
	variants: ProductVariant[];
	addFiles: File[] | null;
};

export default function ProductForm({
	product,
	categories,
	onSaved,
}: {
	product?: ProductRow | null;
	categories: ProductCategory[];
	onSaved?: (id?: string) => void;
}) {
	const methods = useForm<FormValues>({
		defaultValues: product ?? {
			title: "",
			slug: "",
			description: "",
			shortDescription: "",
			categories: [],
			sku: "",
			price: 0,
			compareAtPrice: null,
			stock: 0,
			featured: false,
			status: "draft",
			hasVariants: false,
			variants: [],
			addFiles: null,
		},
	});

	const { control, register, handleSubmit, reset } = methods;
	const {
		fields: variantFields,
		append: addVariant,
		remove: removeVariant,
	} = useFieldArray({ control, name: "variants" });

	const [existing, setExisting] = useState<ProductImage[]>(
		product?.images ?? []
	);
	const [toRemove, setToRemove] = useState<Set<string>>(new Set());
	const [saving, setSaving] = useState(false);
	const [err, setErr] = useState<string | null>(null);
	const [ok, setOk] = useState<string | null>(null);

	useEffect(() => {
		reset(
			product ?? {
				title: "",
				slug: "",
				description: "",
				shortDescription: "",
				categories: [],
				sku: "",
				price: 0,
				compareAtPrice: null,
				stock: 0,
				featured: false,
				status: "draft",
				hasVariants: false,
				variants: [],
				addFiles: null,
			}
		);
		setExisting(product?.images ?? []);
		setToRemove(new Set());
		setErr(null);
		setOk(null);
	}, [product, reset]);

	const addFiles = useWatch({ control, name: "addFiles" });
	const previewFiles = useMemo(
		() =>
			!addFiles
				? []
				: Array.from(addFiles).map((f) => ({
						name: f.name,
						url: URL.createObjectURL(f),
				  })),
		[addFiles]
	);

	function toggleRemove(p: string) {
		setToRemove((prev) => {
			const n = new Set(prev);
			n.has(p) ? n.delete(p) : n.add(p);
			return n;
		});
	}

	const onSubmit = handleSubmit(async (v) => {
		setSaving(true);
		setErr(null);
		setOk(null);
		try {
			if (product) {
				await ProductsService.update(product.id, {
					...v,
					addFiles: v.addFiles ? Array.from(v.addFiles) : [],
					removePaths: Array.from(toRemove),
				});
				setOk("Producto actualizado.");
				onSaved?.(product.id);
			} else {
				const res = await ProductsService.create({
					...v,
					files: v.addFiles ? Array.from(v.addFiles) : [],
				});
				setOk("Producto creado.");
				reset({
					title: "",
					slug: "",
					description: "",
					shortDescription: "",
					categories: [],
					sku: "",
					price: 0,
					compareAtPrice: null,
					stock: 0,
					featured: false,
					status: "draft",
					hasVariants: false,
					variants: [],
					addFiles: null,
				});
				setExisting([]);
				setToRemove(new Set());
				onSaved?.(res.id);
			}
		} catch (e: any) {
			setErr(e?.message || "No se pudo guardar.");
		} finally {
			setSaving(false);
		}
	});

	const hasVariants = useWatch({ control, name: "hasVariants" });

	return (
		<FormProvider {...methods}>
			<form onSubmit={onSubmit} className="space-y-6">
				<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
					<div className="space-y-4">
						<RHFInput
							name="title"
							label="Título"
							placeholder="Ej. Plano Casa A1"
						/>
						<RHFInput
							name="slug"
							label="Slug (URL)"
							placeholder="plano-casa-a1"
						/>
						<RHFInput name="sku" label="SKU (opcional)" placeholder="SKU-001" />
						<div className="space-y-1.5">
							<label className="text-sm font-medium text-slate-700">
								Descripción corta
							</label>
							<input
								className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
								{...register("shortDescription")}
							/>
						</div>
						<div className="space-y-1.5">
							<label className="text-sm font-medium text-slate-700">
								Descripción
							</label>
							<textarea
								rows={6}
								className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
								{...register("description")}
							/>
						</div>
						<div className="space-y-1.5">
							<label className="text-sm font-medium text-slate-700">
								Categorías
							</label>
							<div className="flex flex-wrap gap-2">
								{categories.map((c) => (
									<label key={c.id} className="flex items-center gap-1 text-sm">
										<input
											type="checkbox"
											value={c.id}
											{...register("categories")}
										/>
										{c.name}
									</label>
								))}
							</div>
						</div>
						<div className="grid grid-cols-3 gap-3">
							<RHFInput
								name="price"
								label="Precio base ($)"
								type="number"
								step="0.01"
							/>
							<RHFInput
								name="compareAtPrice"
								label="Precio tachado ($)"
								type="number"
								step="0.01"
							/>
							<RHFInput
								name="stock"
								label="Stock base"
								type="number"
								step="1"
							/>
						</div>

						<div className="flex items-center gap-4">
							<label className="flex items-center gap-2 text-sm">
								<input type="checkbox" {...register("featured")} /> Destacado
							</label>
							<label className="flex items-center gap-2 text-sm">
								Estado:
								<select
									className="rounded border px-2 py-1 text-sm"
									{...register("status")}
								>
									<option value="draft">Borrador</option>
									<option value="published">Publicado</option>
								</select>
							</label>
						</div>
					</div>

					<div className="space-y-4">
						<RHFFileInput name="addFiles" label="Imágenes" multiple />
						{previewFiles.length > 0 && (
							<div className="rounded-lg border">
								<div className="bg-gray-50 px-3 py-2 text-sm font-medium">
									Vista previa (nuevas)
								</div>
								<div className="grid grid-cols-3 gap-2 p-3">
									{previewFiles.map((f) => (
										<div
											key={f.url}
											className="relative aspect-video overflow-hidden rounded border"
										>
											<img
												src={f.url}
												alt={f.name}
												className="h-full w-full object-cover"
											/>
										</div>
									))}
								</div>
							</div>
						)}
						{existing.length > 0 && (
							<div className="rounded-lg border">
								<div className="bg-gray-50 px-3 py-2 text-sm font-medium">
									Imágenes actuales
								</div>
								<div className="grid grid-cols-3 gap-2 p-3">
									{existing.map((img) => {
										const marked = toRemove.has(img.path);
										return (
											<div key={img.path}>
												<div
													className={`aspect-video overflow-hidden rounded border ${
														marked ? "opacity-50" : ""
													}`}
												>
													<img
														src={img.url}
														alt={img.name || ""}
														className="h-full w-full object-cover"
													/>
												</div>
												<label className="mt-1 flex items-center gap-2 text-xs">
													<input
														type="checkbox"
														checked={marked}
														onChange={() => toggleRemove(img.path)}
													/>{" "}
													Eliminar
												</label>
											</div>
										);
									})}
								</div>
							</div>
						)}

						<label className="flex items-center gap-2 text-sm">
							<input type="checkbox" {...register("hasVariants")} /> Este
							producto tiene variantes
						</label>

						{hasVariants && (
							<div className="rounded-lg border">
								<div className="flex items-center justify-between border-b bg-slate-50 px-3 py-2">
									<div className="text-sm font-medium">Variantes</div>
									<Button
										type="button"
										variant="outline"
										onClick={() =>
											addVariant({
												id: crypto.randomUUID(),
												name: "",
												price: 0,
												stock: 0,
												active: true,
											})
										}
									>
										+ Añadir variante
									</Button>
								</div>
								<div className="divide-y">
									{variantFields.map((f, i) => (
										<div
											key={f.id}
											className="grid grid-cols-12 gap-2 px-3 py-2"
										>
											<input
												className="col-span-4 rounded border px-2 py-1 text-sm"
												placeholder="Nombre"
												{...register(`variants.${i}.name` as const)}
											/>
											<input
												className="col-span-2 rounded border px-2 py-1 text-sm"
												placeholder="SKU"
												{...register(`variants.${i}.sku` as const)}
											/>
											<input
												type="number"
												step="0.01"
												className="col-span-2 rounded border px-2 py-1 text-sm"
												placeholder="Precio"
												{...register(`variants.${i}.price` as const, {
													valueAsNumber: true,
												})}
											/>
											<input
												type="number"
												step="1"
												className="col-span-2 rounded border px-2 py-1 text-sm"
												placeholder="Stock"
												{...register(`variants.${i}.stock` as const, {
													valueAsNumber: true,
												})}
											/>
											<div className="col-span-2 flex items-center justify-end">
												<button
													type="button"
													onClick={() => removeVariant(i)}
													className="rounded border border-rose-200 bg-rose-50 px-2 py-1 text-xs text-rose-700"
												>
													Eliminar
												</button>
											</div>
										</div>
									))}
								</div>
							</div>
						)}
					</div>
				</div>

				<div className="flex items-center gap-3">
					<Button type="submit" disabled={saving}>
						{saving
							? "Guardando…"
							: product
							? "Guardar cambios"
							: "Crear producto"}
					</Button>
					{err && <span className="text-sm text-red-600">{err}</span>}
					{ok && <span className="text-sm text-green-600">{ok}</span>}
				</div>
			</form>
		</FormProvider>
	);
}
