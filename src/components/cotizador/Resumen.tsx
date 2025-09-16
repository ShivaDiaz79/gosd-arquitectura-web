"use client";

import { useMemo } from "react";
import { useWatch } from "react-hook-form";
import {
	COSTOS_M2,
	TARIFAS_ENTREGABLES_M2,
	TARIFAS_EJECUTABLES_M2,
} from "@/lib/constants/cotizador";
import { keyFromCategoria, toNumber } from "@/lib/helpers/cotizador";

const currency = (n: number) =>
	n.toLocaleString("es-BO", {
		style: "currency",
		currency: "BOB",
		maximumFractionDigits: 2,
	});

const Resumen: React.FC = () => {
	const [
		servicio,
		l1,
		l2,
		l3,
		m2,
		todoDiseno,
		entregables,
		todoConstruccion,
		ejecutables,
	] = useWatch({
		name: [
			"servicio",
			"categoria_l1",
			"categoria_l2",
			"categoria_l3",
			"superficie_m2",
			"todo_diseno",
			"entregables",
			"todo_construccion",
			"ejecutables",
		],
	}) as any[];

	const { subtotalDiseno, subtotalConstruccion, detalle } = useMemo(() => {
		const key = keyFromCategoria(l1, l2, l3);
		const base = COSTOS_M2[key] || {};
		const superficie = toNumber(m2);

		let subtotalDiseno = 0;
		let subtotalConstruccion = 0;
		const detalle: {
			concepto: string;
			unit?: number;
			total?: number;
			nota?: string;
		}[] = [];

		if (servicio === "diseno" || servicio === "diseno_construccion") {
			if (base.diseno && superficie) {
				const total = base.diseno * superficie;
				subtotalDiseno += total;
				detalle.push({
					concepto: `Diseño — Base categoría (${key})`,
					unit: base.diseno,
					total,
				});
			} else {
				detalle.push({
					concepto: `Diseño — Base categoría (${key})`,
					nota: "tarifa por definir",
				});
			}
		}

		if (servicio === "construccion" || servicio === "diseno_construccion") {
			if (base.construccion && superficie) {
				const total = base.construccion * superficie;
				subtotalConstruccion += total;
				detalle.push({
					concepto: `Construcción — Base categoría (${key})`,
					unit: base.construccion,
					total,
				});
			} else {
				detalle.push({
					concepto: `Construcción — Base categoría (${key})`,
					nota: "tarifa por definir",
				});
			}
		}

		if (
			(servicio === "diseno" || servicio === "diseno_construccion") &&
			!todoDiseno
		) {
			const list: string[] = Array.isArray(entregables) ? entregables : [];
			list.forEach((val) => {
				const unit = TARIFAS_ENTREGABLES_M2[val];
				if (unit && superficie) {
					const total = unit * superficie;
					subtotalDiseno += total;
					detalle.push({ concepto: `Diseño — ${val}`, unit, total });
				} else {
					detalle.push({
						concepto: `Diseño — ${val}`,
						nota: "tarifa por definir",
					});
				}
			});
		}

		if (
			(servicio === "construccion" || servicio === "diseno_construccion") &&
			!todoConstruccion
		) {
			const list: string[] = Array.isArray(ejecutables) ? ejecutables : [];
			list.forEach((val) => {
				const unit = TARIFAS_EJECUTABLES_M2[val];
				if (unit && superficie) {
					const total = unit * superficie;
					subtotalConstruccion += total;
					detalle.push({ concepto: `Construcción — ${val}`, unit, total });
				} else {
					detalle.push({
						concepto: `Construcción — ${val}`,
						nota: "tarifa por definir",
					});
				}
			});
		}

		return { subtotalDiseno, subtotalConstruccion, detalle };
	}, [
		servicio,
		l1,
		l2,
		l3,
		m2,
		todoDiseno,
		entregables,
		todoConstruccion,
		ejecutables,
	]);

	const total = subtotalDiseno + subtotalConstruccion;

	return (
		<section className="rounded-lg border border-gray-200 p-4 dark:border-gray-800">
			<h3 className="mb-3 text-lg font-semibold">Resumen de cotización</h3>

			<ul className="space-y-2 text-sm">
				{detalle.map((d, i) => (
					<li key={i} className="flex items-center justify-between">
						<span className="text-gray-700 dark:text-gray-300">
							{d.concepto}
						</span>
						{d.nota ? (
							<span className="text-xs text-amber-600">{d.nota}</span>
						) : (
							<div className="text-right">
								<div className="text-gray-500 text-xs">
									Unit: {currency(d.unit || 0)} / m²
								</div>
								<div className="font-medium">{currency(d.total || 0)}</div>
							</div>
						)}
					</li>
				))}
			</ul>

			<div className="mt-4 border-t pt-3 text-right">
				<div className="text-sm text-gray-600 dark:text-gray-400">
					Subtotal Diseño: <b>{currency(subtotalDiseno)}</b>
				</div>
				<div className="text-sm text-gray-600 dark:text-gray-400">
					Subtotal Construcción: <b>{currency(subtotalConstruccion)}</b>
				</div>
				<div className="mt-1 text-base font-semibold">
					Total: {currency(total)}
				</div>
			</div>

			<p className="mt-3 text-xs text-gray-500">
				Nota: si seleccionas <b>TODO/Completo</b> en Diseño o Construcción, los
				entregables/ejecutables específicos se determinan automáticamente por
				categoría y superficie (usa las tarifas base por m² configuradas).
			</p>
		</section>
	);
};

export default Resumen;
