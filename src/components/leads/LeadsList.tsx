"use client";

import { useEffect, useState } from "react";
import { LeadsService } from "@/services/LeadsService";
import type { LeadDoc, LeadFormValues, ListResult } from "@/lib/types/leads";
import {
	Table,
	TableHeader,
	TableBody,
	TableRow,
	TableCell,
} from "@/components/ui/table";
import Pagination from "@/components/tables/Pagination";
import { Dropdown } from "@/components/ui/dropdown/Dropdown";
import { DropdownItem } from "@/components/ui/dropdown/DropdownItem";
import { Modal } from "@/components/ui/modal";
import LeadForm from "@/components/leads/LeadForm";
import { Timestamp } from "firebase/firestore";
import { format } from "date-fns";
import { es } from "date-fns/locale";

type CursorPage = { page: number; cursor: any | null };

function mapLeadDocToFormValues(lead: LeadDoc): LeadFormValues {
	return {
		nombreCompleto: lead.nombreCompleto ?? "",
		telefono: lead.telefono ?? "",
		email: lead.email ?? "",
		servicio: lead.servicio,
		categoria: (lead.categoria as any) ?? "",
		subcategoria: lead.subcategoria ?? "",
		presupuesto: lead.presupuesto ?? "",
		fuente: lead.fuente,
		estado: lead.estado,
		obsQuiereCotizacion: !!lead.obsQuiereCotizacion,
		obsTerrenoPropio: !!lead.obsTerrenoPropio,
		responsableSeguimiento: lead.responsableSeguimiento ?? "Erwin",
		responsableCierre: lead.responsableCierre ?? "Arq. Gonzalo",
		consultaRapida: lead.consultaRapida as string | undefined,
	};
}

export default function LeadsPage() {
	const [items, setItems] = useState<LeadDoc[]>([]);
	const [loading, setLoading] = useState(true);

	const [currentPage, setCurrentPage] = useState(1);
	const [cursors, setCursors] = useState<CursorPage[]>([
		{ page: 1, cursor: null },
	]);
	const [totalPages, setTotalPages] = useState(1);

	const [menuOpenFor, setMenuOpenFor] = useState<string | null>(null);

	const [openCreate, setOpenCreate] = useState(false);

	const [openEdit, setOpenEdit] = useState(false);
	const [editId, setEditId] = useState<string | null>(null);
	const [editData, setEditData] = useState<LeadFormValues | null>(null);
	const [loadingEdit, setLoadingEdit] = useState(false);

	const [openDelete, setOpenDelete] = useState(false);
	const [deleteId, setDeleteId] = useState<string | null>(null);
	const [deleteHard, setDeleteHard] = useState(false);
	const [submitting, setSubmitting] = useState(false);

	const pageSize = 10;

	const formatDate = (ts: Timestamp | null) =>
		ts ? format(ts.toDate(), "dd MMM yyyy HH:mm", { locale: es }) : "-";

	const fetchPage = async (page: number) => {
		setLoading(true);
		const existing = cursors.find((c) => c.page === page);
		const cursorToUse = existing
			? existing.cursor
			: cursors[cursors.length - 1].cursor;

		const res: ListResult = await LeadsService.list({
			pageSize,
			cursor: cursorToUse,
			includeDeleted: false,
			orderByField: "createdAt",
			orderDir: "desc",
		});

		setItems(res.items);
		setLoading(false);

		if (!existing) {
			setCursors((old) => [...old, { page: page + 1, cursor: res.nextCursor }]);
		}
		if (res.total !== undefined) {
			setTotalPages(Math.max(1, Math.ceil(res.total / pageSize)));
		}
	};

	useEffect(() => {
		fetchPage(1);
	}, []);

	const onPageChange = (page: number) => {
		if (page < 1 || page > totalPages) return;
		setCurrentPage(page);
		fetchPage(page);
	};

	const openCreateModal = () => {
		setOpenCreate(true);
	};

	const openEditModal = async (id: string) => {
		setOpenEdit(true);
		setEditId(id);
		setLoadingEdit(true);
		const data = await LeadsService.getById(id);
		setLoadingEdit(false);
		if (!data) {
			setEditData(null);
			return;
		}
		setEditData(mapLeadDocToFormValues(data));
	};

	const openDeleteModal = (id: string, hard = false) => {
		setDeleteId(id);
		setDeleteHard(hard);
		setOpenDelete(true);
	};

	const handleCreate = async (values: LeadFormValues) => {
		setSubmitting(true);
		await LeadsService.create(values);
		setSubmitting(false);
		setOpenCreate(false);
		fetchPage(currentPage);
	};

	const handleEdit = async (values: LeadFormValues) => {
		if (!editId) return;
		setSubmitting(true);
		await LeadsService.update(editId, values);
		setSubmitting(false);
		setOpenEdit(false);
		setEditId(null);
		setEditData(null);
		fetchPage(currentPage);
	};

	const handleConfirmDelete = async () => {
		if (!deleteId) return;
		setSubmitting(true);
		if (deleteHard) {
			await LeadsService.hardDelete(deleteId);
		} else {
			await LeadsService.softDelete(deleteId);
		}
		setSubmitting(false);
		setOpenDelete(false);
		setDeleteId(null);
		fetchPage(currentPage);
	};

	return (
		<div className="space-y-6">
			<div className="flex justify-between items-center">
				<h2 className="text-xl font-semibold">Listado</h2>

				<button
					onClick={openCreateModal}
					className="rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
				>
					Nuevo lead
				</button>
			</div>

			<div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
				<Table className="divide-y divide-gray-200 dark:divide-gray-800">
					<TableHeader>
						<TableRow className="bg-gray-50 dark:bg-gray-800/40">
							<TableCell
								isHeader
								className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider"
							>
								Nombre
							</TableCell>
							<TableCell isHeader className="px-4 py-3">
								Contacto
							</TableCell>
							<TableCell isHeader className="px-4 py-3">
								Proyecto
							</TableCell>
							<TableCell isHeader className="px-4 py-3">
								Estado
							</TableCell>
							<TableCell isHeader className="px-4 py-3">
								Fuente
							</TableCell>
							<TableCell isHeader className="px-4 py-3">
								Creado
							</TableCell>
							<TableCell isHeader className="px-4 py-3">
								<span className="sr-only">Acciones</span>
							</TableCell>
						</TableRow>
					</TableHeader>

					<TableBody>
						{loading ? (
							<TableRow>
								<TableCell colSpan={7} className="px-4 py-6">
									Cargando...
								</TableCell>
							</TableRow>
						) : items.length === 0 ? (
							<TableRow>
								<TableCell colSpan={7} className="px-4 py-6">
									Sin registros.
								</TableCell>
							</TableRow>
						) : (
							items.map((lead) => {
								const isDeleted = !!lead.deletedAt;
								return (
									<TableRow
										key={lead.id}
										className="hover:bg-gray-50 dark:hover:bg-white/[0.03]"
									>
										<TableCell className="px-4 py-3">
											<div className="font-medium">{lead.nombreCompleto}</div>
											<div className="text-xs text-gray-500">
												{lead.servicio?.toUpperCase?.()}
											</div>
										</TableCell>
										<TableCell className="px-4 py-3 text-sm">
											<div>{lead.telefono || "-"}</div>
											<div className="text-gray-500">{lead.email || "-"}</div>
										</TableCell>
										<TableCell className="px-4 py-3 text-sm">
											{lead.categoria || "-"}
											{lead.subcategoria ? ` · ${lead.subcategoria}` : ""}
										</TableCell>
										<TableCell className="px-4 py-3">
											<span
												className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
													lead.estado === "confirmado"
														? "bg-green-100 text-green-800"
														: lead.estado === "seguimiento"
														? "bg-yellow-100 text-yellow-800"
														: lead.estado === "desestimado"
														? "bg-gray-200 text-gray-700"
														: "bg-blue-100 text-blue-800"
												}`}
											>
												{lead.estado}
											</span>
											{isDeleted && (
												<span className="ml-2 text-xs text-red-600">
													Eliminado
												</span>
											)}
										</TableCell>
										<TableCell className="px-4 py-3 text-sm">
											{lead.fuente}
										</TableCell>
										<TableCell className="px-4 py-3 text-sm">
											{formatDate(lead.createdAt)}
										</TableCell>
										<TableCell className="px-4 py-3 text-right relative">
											<button
												className="dropdown-toggle rounded-lg border px-2.5 py-1.5 text-sm"
												onClick={() =>
													setMenuOpenFor((prev) =>
														prev === lead.id ? null : lead.id
													)
												}
											>
												⋯
											</button>
											<Dropdown
												isOpen={menuOpenFor === lead.id}
												onClose={() => setMenuOpenFor(null)}
												className="min-w-[200px]"
											>
												<DropdownItem
													onClick={() => {
														setMenuOpenFor(null);
														openEditModal(lead.id);
													}}
												>
													Editar
												</DropdownItem>
												{!isDeleted ? (
													<DropdownItem
														onClick={() => {
															setMenuOpenFor(null);
															openDeleteModal(lead.id, false);
														}}
													>
														Eliminar (suave)
													</DropdownItem>
												) : (
													<>
														<DropdownItem
															onClick={async () => {
																setMenuOpenFor(null);
																await LeadsService.restore(lead.id);
																fetchPage(currentPage);
															}}
														>
															Restaurar
														</DropdownItem>
														<DropdownItem
															className="text-red-600"
															onClick={() => {
																setMenuOpenFor(null);
																openDeleteModal(lead.id, true);
															}}
														>
															Eliminar definitivamente
														</DropdownItem>
													</>
												)}
											</Dropdown>
										</TableCell>
									</TableRow>
								);
							})
						)}
					</TableBody>
				</Table>
			</div>

			<div className="flex justify-end">
				<Pagination
					currentPage={currentPage}
					totalPages={totalPages}
					onPageChange={onPageChange}
				/>
			</div>

			<Modal
				isOpen={openCreate}
				onClose={() => !submitting && setOpenCreate(false)}
				className="max-w-3xl w-full p-4 sm:p-6"
				showCloseButton
				closeOnOverlay={!submitting}
				closeOnEsc={!submitting}
				disableManualClose={submitting}
			>
				<div className="p-2 sm:p-0">
					<h3 className="text-lg font-semibold mb-4">Nuevo lead</h3>
					<LeadForm onSubmitLead={handleCreate} />
					{submitting && (
						<p className="mt-3 text-sm text-gray-500">Guardando...</p>
					)}
				</div>
			</Modal>

			<Modal
				isOpen={openEdit}
				onClose={() => !submitting && setOpenEdit(false)}
				className="max-w-3xl w-full p-4 sm:p-6"
				showCloseButton
				closeOnOverlay={!submitting}
				closeOnEsc={!submitting}
				disableManualClose={submitting}
			>
				<div className="p-2 sm:p-0">
					<h3 className="text-lg font-semibold mb-4">Editar lead</h3>
					{loadingEdit ? (
						<div className="py-8 text-sm text-gray-500">Cargando datos...</div>
					) : !editData ? (
						<div className="py-8 text-sm text-red-600">
							No se encontró el registro.
						</div>
					) : (
						<LeadForm
							onSubmitLead={handleEdit}
							defaultValues={
								editData
									? {
											...editData,
											consultaRapida: editData.consultaRapida as any,
									  }
									: undefined
							}
						/>
					)}
					{submitting && (
						<p className="mt-3 text-sm text-gray-500">Guardando cambios...</p>
					)}
				</div>
			</Modal>

			<Modal
				isOpen={openDelete}
				onClose={() => !submitting && setOpenDelete(false)}
				className="max-w-md w-full p-4 sm:p-6"
				showCloseButton
				closeOnOverlay={!submitting}
				closeOnEsc={!submitting}
				disableManualClose={submitting}
			>
				<div className="p-2 sm:p-0">
					<h3 className="text-lg font-semibold mb-2">
						{deleteHard ? "Eliminar definitivamente" : "Eliminar (suave)"}
					</h3>
					<p className="text-sm text-gray-600 dark:text-gray-300">
						{deleteHard
							? "Esta acción no se puede deshacer. ¿Deseas borrar el lead permanentemente?"
							: "El lead se marcará como eliminado y podrás restaurarlo más tarde. ¿Deseas continuar?"}
					</p>
					<div className="mt-5 flex items-center gap-3 justify-end">
						<button
							className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800"
							onClick={() => setOpenDelete(false)}
							disabled={submitting}
						>
							Cancelar
						</button>
						<button
							className={`rounded-lg px-4 py-2.5 text-sm font-semibold text-white ${
								deleteHard
									? "bg-red-600 hover:bg-red-700"
									: "bg-brand-600 hover:bg-brand-700"
							} disabled:opacity-60`}
							onClick={handleConfirmDelete}
							disabled={submitting}
						>
							{submitting
								? "Procesando..."
								: deleteHard
								? "Eliminar definitivamente"
								: "Eliminar"}
						</button>
					</div>
				</div>
			</Modal>
		</div>
	);
}
