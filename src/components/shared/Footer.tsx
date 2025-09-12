import type { FC, SVGProps } from "react";
import Facebook from "../icons/Facebook";
import Instagram from "../icons/Instagram";
import TikTok from "../icons/Tiktok";
import LinkedIn from "../icons/LinkedIn";
import WhatsApp from "../icons/WhatsApp";
import Phone from "../icons/Phone";
import Mail from "../icons/Mail";
import MapPin from "../icons/MapPin";

import {
	BRAND,
	EMAIL,
	FACEBOOK,
	INSTAGRAM,
	LINKEDIN,
	MAPS_URL,
	PHONE_E164,
	PHONE_HUMAN,
	TIKTOK,
	WHATSAPP_URL,
} from "@/lib/constants/information";

const Icons = {};

const Footer: FC = () => {
	const year = new Date().getFullYear();

	return (
		<footer className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
			<div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 lg:gap-12">
					<div>
						<span className="block text-xl sm:text-2xl font-semibold tracking-tight text-gray-900 dark:text-gray-100">
							{BRAND}
						</span>
						<p className="mt-3 text-sm sm:text-[15px] leading-6 text-gray-600 dark:text-gray-300">
							Estudio especializado en diseño, construcción y servicios
							profesionales para el desarrollo de proyectos arquitectónicos en
							Bolivia.
						</p>

						<div className="mt-5 flex flex-col sm:flex-row gap-3 sm:items-center justify-center">
							<a
								href={WHATSAPP_URL}
								target="_blank"
								rel="noopener noreferrer"
								className="w-full sm:w-auto inline-flex justify-center sm:justify-start items-center gap-2 rounded-md border border-green-600 text-green-700 dark:text-green-400 px-4 py-2 text-sm font-medium hover:bg-green-50 dark:hover:bg-green-950/40 transition"
								aria-label="Chatear por WhatsApp"
							>
								<WhatsApp className="h-5 w-5" />
							</a>

							<a
								href={`tel:${PHONE_E164}`}
								className="w-full sm:w-auto inline-flex justify-center sm:justify-start items-center gap-2 rounded-md border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-900 transition"
							>
								<Phone className="h-5 w-5" />
								{PHONE_HUMAN}
							</a>

							<a
								href={MAPS_URL}
								target="_blank"
								rel="noopener noreferrer"
								className="w-full sm:w-auto inline-flex justify-center sm:justify-start items-center gap-2 rounded-md border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-900 transition"
							>
								<MapPin className="h-5 w-5" />
								Ubicacion
							</a>
						</div>

						<ul className="mt-6 w-full flex flex-wrap items-center justify-center md:justify-center gap-4 md:gap-6 text-sm">
							<li>
								<a
									className="text-gray-600 dark:text-gray-300 hover:underline inline-flex items-center gap-2"
									href={FACEBOOK}
									target="_blank"
									rel="noopener noreferrer"
									aria-label="Facebook"
								>
									<Facebook className="h-6 w-6 md:h-7 md:w-7" />
								</a>
							</li>
							<li>
								<a
									className="text-gray-600 dark:text-gray-300 hover:underline inline-flex items-center gap-2"
									href={INSTAGRAM}
									target="_blank"
									rel="noopener noreferrer"
									aria-label="Instagram"
								>
									<Instagram className="h-6 w-6 md:h-7 md:w-7" />
								</a>
							</li>
							<li>
								<a
									className="text-gray-600 dark:text-gray-300 hover:underline inline-flex items-center gap-2"
									href={TIKTOK}
									target="_blank"
									rel="noopener noreferrer"
									aria-label="TikTok"
								>
									<TikTok className="h-6 w-6 md:h-7 md:w-7" />
								</a>
							</li>
							<li>
								<a
									className="text-gray-600 dark:text-gray-300 hover:underline inline-flex items-center gap-2"
									href={LINKEDIN}
									target="_blank"
									rel="noopener noreferrer"
									aria-label="LinkedIn"
								>
									<LinkedIn className="h-6 w-6 md:h-7 md:w-7" />
								</a>
							</li>
						</ul>
					</div>

					<div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-10">
						<div>
							<h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
								Servicios
							</h3>
							<ul className="mt-4 space-y-2 text-sm">
								<li className="text-gray-600 dark:text-gray-300">Diseño</li>
								<li className="text-gray-600 dark:text-gray-300">
									Construcción
								</li>
								<li className="text-gray-600 dark:text-gray-300">
									Consultorías
								</li>
								<li className="text-gray-600 dark:text-gray-300">Avalúos</li>
								<li className="text-gray-600 dark:text-gray-300">
									Supervisión, Fiscalización y Administración de Obras
								</li>
							</ul>
						</div>

						<div>
							<h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
								Contacto
							</h3>
							<ul className="mt-4 space-y-3 text-sm">
								<li>
									<a
										className="text-gray-600 dark:text-gray-300 hover:underline inline-flex items-center gap-2"
										href={`tel:${PHONE_E164}`}
									>
										<Phone className="h-4 w-4" />
										Tel: {PHONE_HUMAN}
									</a>
								</li>
								<li>
									<a
										className="text-gray-600 dark:text-gray-300 hover:underline inline-flex items-start gap-2 break-words"
										href={`mailto:${EMAIL}`}
									>
										<Mail className="h-4 w-4 mt-0.5 flex-shrink-0" />
										<span className="break-words">{EMAIL}</span>
									</a>
								</li>
								<li>
									<a
										className="text-gray-600 dark:text-gray-300 hover:underline inline-flex items-center gap-2"
										href={WHATSAPP_URL}
										target="_blank"
										rel="noopener noreferrer"
									>
										<WhatsApp className="h-4 w-4" />
										WhatsApp Business
									</a>
								</li>
								<li>
									<a
										className="text-gray-600 dark:text-gray-300 hover:underline inline-flex items-center gap-2"
										href={MAPS_URL}
										target="_blank"
										rel="noopener noreferrer"
									>
										<MapPin className="h-4 w-4" />
										Ubicación
									</a>
								</li>
							</ul>
						</div>
					</div>
				</div>

				<div className="mt-12 border-t border-gray-100 dark:border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
					<p className="text-xs text-gray-500 dark:text-gray-400 text-center sm:text-left">
						© Astro Estudio. Todos los derechos reservados.
					</p>
				</div>
			</div>
		</footer>
	);
};

export default Footer;
