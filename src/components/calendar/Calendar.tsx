"use client";

import React, { useEffect, useRef, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import esLocale from "@fullcalendar/core/locales/es";
import {
	DateSelectArg,
	EventClickArg,
	EventContentArg,
	EventInput,
} from "@fullcalendar/core";

import { useModal } from "@/hooks/useModal";
import { Modal } from "@/components/ui/modal";
import { ConfirmDeleteModal } from "@/components/shared/ConfirmDeleteModal";
import {
	CalendarService,
	type CalendarEvent,
	type CalendarCategory,
} from "@/services/CalendarService";

const Calendar: React.FC = () => {
	const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
		null
	);
	const [eventTitle, setEventTitle] = useState("");
	const [eventStartDate, setEventStartDate] = useState("");
	const [eventEndDate, setEventEndDate] = useState("");
	const [eventLevel, setEventLevel] = useState<CalendarCategory>("primary");
	const [events, setEvents] = useState<CalendarEvent[]>([]);
	const [loading, setLoading] = useState(true);
	const [confirmOpen, setConfirmOpen] = useState(false);

	const calendarRef = useRef<FullCalendar>(null);
	const { isOpen, openModal, closeModal } = useModal();

	const calendarCategories = {
		danger: { label: "Importante", className: "danger" },
		success: { label: "Éxito", className: "success" },
		primary: { label: "Principal", className: "primary" },
		warning: { label: "Advertencia", className: "warning" },
	} as const;
	type CategoryKey = keyof typeof calendarCategories;

	// Suscripción a Firestore (tiempo real)
	useEffect(() => {
		const unsub = CalendarService.subscribe((liveEvents) => {
			setEvents(liveEvents);
			setLoading(false);
		});
		return () => unsub();
	}, []);

	const resetModalFields = () => {
		setEventTitle("");
		setEventStartDate("");
		setEventEndDate("");
		setEventLevel("primary");
		setSelectedEvent(null);
	};

	const handleDateSelect = (selectInfo: DateSelectArg) => {
		resetModalFields();
		setEventStartDate(selectInfo.startStr);
		setEventEndDate(selectInfo.endStr || selectInfo.startStr);
		openModal();
	};

	const handleEventClick = (clickInfo: EventClickArg) => {
		const ev = clickInfo.event;
		const mapped: CalendarEvent = {
			id: ev.id,
			title: ev.title,
			start: ev.startStr || ev.start?.toISOString().split("T")[0] || "",
			end: ev.endStr || ev.end?.toISOString().split("T")[0] || undefined,
			allDay: ev.allDay,
			extendedProps: {
				calendar: ev.extendedProps.calendar as string as CalendarCategory,
			},
		};
		setSelectedEvent(mapped);
		setEventTitle(mapped.title);
		setEventStartDate(mapped.start);
		setEventEndDate(mapped.end || "");
		setEventLevel(mapped.extendedProps.calendar || "primary");
		openModal();
	};

	const handleAddOrUpdateEvent = async () => {
		if (!eventTitle.trim()) {
			alert("Por favor, ingresa un título.");
			return;
		}
		if (!eventStartDate) {
			alert("Por favor, elige una fecha de inicio.");
			return;
		}
		try {
			if (selectedEvent) {
				await CalendarService.update(selectedEvent.id, {
					title: eventTitle.trim(),
					start: eventStartDate,
					end: eventEndDate || null,
					allDay: true,
					calendar: eventLevel,
				});
			} else {
				await CalendarService.create({
					title: eventTitle.trim(),
					start: eventStartDate,
					end: eventEndDate || null,
					allDay: true,
					calendar: eventLevel,
				});
			}
			closeModal();
			resetModalFields();
			// onSnapshot actualizará la lista en tiempo real
		} catch (e) {
			console.error(e);
			alert("Ocurrió un error al guardar el evento.");
		}
	};

	const askDelete = () => setConfirmOpen(true);

	const handleDeleteConfirmed = async () => {
		if (!selectedEvent) return;
		await CalendarService.delete(selectedEvent.id);
		setConfirmOpen(false);
		closeModal();
		resetModalFields();
	};

	return (
		<div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
			<div className="custom-calendar">
				<FullCalendar
					ref={calendarRef}
					plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
					initialView="dayGridMonth"
					locales={[esLocale]}
					locale="es"
					headerToolbar={{
						left: "prev,next addEventButton",
						center: "title",
						right: "dayGridMonth,timeGridWeek,timeGridDay",
					}}
					events={events as EventInput[]}
					selectable={true}
					select={handleDateSelect}
					eventClick={handleEventClick}
					eventContent={(args) =>
						renderEventContent(args, calendarCategories as any)
					}
					customButtons={{
						addEventButton: {
							text: "Agregar evento +",
							click: openModal,
						},
					}}
				/>
				{loading && (
					<div className="p-4 text-sm text-gray-500 dark:text-gray-400">
						Cargando eventos...
					</div>
				)}
			</div>

			{/* Modal de alta/edición */}
			<Modal
				isOpen={isOpen}
				onClose={closeModal}
				className="max-w-[700px] p-6 lg:p-10"
			>
				<div className="flex flex-col px-2 overflow-y-auto custom-scrollbar">
					<div>
						<h5 className="modal-title mb-2 text-theme-xl font-semibold text-gray-800 dark:text-white/90 lg:text-2xl">
							{selectedEvent ? "Editar evento" : "Agregar evento"}
						</h5>
						<p className="text-sm text-gray-500 dark:text-gray-400">
							Programa o edita un evento para mantenerte organizado.
						</p>
					</div>

					<div className="mt-8">
						<div>
							<label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
								Título del evento
							</label>
							<input
								id="event-title"
								type="text"
								value={eventTitle}
								onChange={(e) => setEventTitle(e.target.value)}
								placeholder="Ej.: Reunión con cliente"
								className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
							/>
						</div>

						<div className="mt-6">
							<label className="mb-4 block text-sm font-medium text-gray-700 dark:text-gray-400">
								Categoría / Color
							</label>
							<div className="flex flex-wrap items-center gap-4 sm:gap-5">
								{(Object.keys(calendarCategories) as CategoryKey[]).map((k) => (
									<div key={k} className="n-chk">
										<div
											className={`form-check form-check-${calendarCategories[k].className} form-check-inline`}
										>
											<label
												className="form-check-label flex items-center text-sm text-gray-700 dark:text-gray-400"
												htmlFor={`modal-${k}`}
											>
												<span className="relative">
													<input
														className="form-check-input sr-only"
														type="radio"
														name="event-level"
														value={k}
														id={`modal-${k}`}
														checked={eventLevel === k}
														onChange={() => setEventLevel(k)}
													/>
													<span className="box mr-2 flex h-5 w-5 items-center justify-center rounded-full border border-gray-300 dark:border-gray-700">
														<span
															className={`h-2 w-2 rounded-full bg-white ${
																eventLevel === k ? "block" : "hidden"
															}`}
														></span>
													</span>
												</span>
												{calendarCategories[k].label}
											</label>
										</div>
									</div>
								))}
							</div>
						</div>

						<div className="mt-6">
							<label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
								Fecha de inicio
							</label>
							<div className="relative">
								<input
									id="event-start-date"
									type="date"
									value={eventStartDate}
									onChange={(e) => setEventStartDate(e.target.value)}
									className="h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent bg-none px-4 py-2.5 pl-4 pr-11 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
								/>
							</div>
						</div>

						<div className="mt-6">
							<label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
								Fecha de fin (opcional)
							</label>
							<div className="relative">
								<input
									id="event-end-date"
									type="date"
									value={eventEndDate}
									onChange={(e) => setEventEndDate(e.target.value)}
									className="h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent bg-none px-4 py-2.5 pl-4 pr-11 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
								/>
							</div>
						</div>
					</div>

					<div className="modal-footer mt-6 flex items-center gap-3 sm:justify-end">
						{selectedEvent && (
							<button
								onClick={askDelete}
								type="button"
								className="flex w-full justify-center rounded-lg border border-red-300 bg-white px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-red-900/40 dark:bg-gray-800 dark:text-red-400 sm:w-auto"
							>
								Eliminar
							</button>
						)}
						<button
							onClick={closeModal}
							type="button"
							className="flex w-full justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] sm:w-auto"
						>
							Cerrar
						</button>
						<button
							onClick={handleAddOrUpdateEvent}
							type="button"
							className="btn btn-success btn-update-event flex w-full justify-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 sm:w-auto"
						>
							{selectedEvent ? "Guardar cambios" : "Agregar evento"}
						</button>
					</div>
				</div>
			</Modal>

			{/* Modal de confirmación de eliminación */}
			<ConfirmDeleteModal
				isOpen={confirmOpen}
				onClose={() => setConfirmOpen(false)}
				onConfirm={handleDeleteConfirmed}
				title="Eliminar evento"
				description={`¿Seguro que deseas eliminar “${
					selectedEvent?.title ?? "este evento"
				}”? Esta acción no se puede deshacer.`}
				confirmLabel="Eliminar"
				cancelLabel="Cancelar"
			/>
		</div>
	);
};

const renderEventContent = (
	eventInfo: EventContentArg,
	categories: Record<string, { label: string; className: string }>
) => {
	const slug = (eventInfo.event.extendedProps.calendar as string) || "primary";
	const cls = categories[slug]?.className || "primary";
	const colorClass = `fc-bg-${cls}`;

	return (
		<div
			className={`event-fc-color fc-event-main ${colorClass} flex rounded-sm p-1`}
		>
			<div className="fc-daygrid-event-dot"></div>
			<div className="fc-event-time">{eventInfo.timeText}</div>
			<div className="fc-event-title">{eventInfo.event.title}</div>
		</div>
	);
};

export default Calendar;
