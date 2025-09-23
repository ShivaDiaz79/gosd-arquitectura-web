"use client";

import React, {
	useCallback,
	useMemo,
	useState,
	useEffect,
	FocusEvent,
} from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

type Item = { name: string; path: string };
type MenuItem = { name: string; path: string; desc?: string };

const Navbar: React.FC = () => {
	const pathname = usePathname();
	const [mobileOpen, setMobileOpen] = useState(false);
	const [servicesOpen, setServicesOpen] = useState(false);
	const [obrasOpen, setObrasOpen] = useState(false);
	const prefersReduced = useReducedMotion();

	useEffect(() => {
		setServicesOpen(false);
		setObrasOpen(false);
		setMobileOpen(false);
	}, [pathname]);

	const items: Item[] = useMemo(
		() => [
			{ name: "Inicio", path: "/" },
			{ name: "Servicios", path: "/servicios" },
			{ name: "Obras", path: "/obras" },
			{ name: "Usuarios", path: "/usuarios" },
			{ name: "Contacto", path: "/contacto" },
		],
		[]
	);

	const servicios: MenuItem[] = useMemo(
		() => [
			{
				name: "Diseño arquitectónico",
				path: "/servicios/diseno-arquitectonico",
				desc: "Anteproyecto, proyecto ejecutivo y BIM",
			},
			{
				name: "Construcción",
				path: "/servicios/construccion",
				desc: "Ejecución llave en mano",
			},
		],
		[]
	);

	const obras: MenuItem[] = useMemo(
		() => [
			{
				name: "Residenciales",
				path: "/obras/residenciales",
				desc: "Casas unifamiliares, vivienda colectiva",
			},
			{
				name: "Comerciales",
				path: "/obras/comerciales",
				desc: "Local, oficinas y retail",
			},
			{
				name: "Institucionales",
				path: "/obras/institucionales",
				desc: "Educativo, cultural y salud",
			},
			{
				name: "Espacio público",
				path: "/obras/espacio-publico",
				desc: "Plazas, parques y movilidad",
			},
		],
		[]
	);

	const isActive = useCallback(
		(p: string) => (p === "/" ? pathname === "/" : pathname.startsWith(p)),
		[pathname]
	);

	const handleGroupBlur = (e: FocusEvent<HTMLDivElement>) => {
		const next = e.relatedTarget as Node | null;
		if (!next || !e.currentTarget.contains(next)) {
			setServicesOpen(false);
			setObrasOpen(false);
		}
	};

	const navVariants = {
		hidden: { y: prefersReduced ? 0 : -12, opacity: prefersReduced ? 1 : 0 },
		show: {
			y: 0,
			opacity: 1,
			transition: { type: "spring" as const, stiffness: 120, damping: 16 },
		},
	};

	const listVariants = {
		show: {
			transition: prefersReduced
				? {}
				: { staggerChildren: 0.05, delayChildren: 0.05 },
		},
	};

	const itemVariants = {
		hidden: { y: prefersReduced ? 0 : 6, opacity: prefersReduced ? 1 : 0 },
		show: {
			y: 0,
			opacity: 1,
			transition: { type: "spring" as const, stiffness: 260, damping: 22 },
		},
	};

	const dropdownVariants = {
		hidden: {
			opacity: prefersReduced ? 1 : 0,
			scale: prefersReduced ? 1 : 0.98,
			y: prefersReduced ? 0 : -4,
			pointerEvents: "none" as const,
		},
		show: {
			opacity: 1,
			scale: 1,
			y: 0,
			pointerEvents: "auto" as const,
			transition: { type: "spring" as const, stiffness: 260, damping: 20 },
		},
		exit: {
			opacity: prefersReduced ? 1 : 0,
			scale: prefersReduced ? 1 : 0.98,
			y: prefersReduced ? 0 : -4,
			transition: { duration: 0.12 },
		},
	};

	const mobilePanelVariants = {
		hidden: { opacity: prefersReduced ? 1 : 0, y: prefersReduced ? 0 : -10 },
		show: {
			opacity: 1,
			y: 0,
			transition: prefersReduced
				? {}
				: { type: "spring" as const, stiffness: 180, damping: 20 },
		},
		exit: { opacity: prefersReduced ? 1 : 0, y: prefersReduced ? 0 : -10 },
	};

	return (
		<motion.header
			variants={navVariants}
			initial="hidden"
			animate="show"
			className="sticky top-0 z-50 w-full border-b border-black/10 dark:border-white/10 bg-white/90 dark:bg-black/90 backdrop-blur supports-[backdrop-filter]:bg-white/70 supports-[backdrop-filter]:dark:bg-black/70"
		>
			<nav className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8 h-16 flex items-center">
				<div className="flex items-center gap-3">
					<button
						aria-label="Abrir menú"
						aria-expanded={mobileOpen}
						aria-controls="mobile-menu"
						className="inline-flex items-center justify-center rounded-md border border-black/15 dark:border-white/20 px-2 py-1 lg:hidden"
						onClick={() => setMobileOpen((v) => !v)}
					>
						<svg
							width="20"
							height="20"
							viewBox="0 0 24 24"
							className="text-black dark:text-white"
						>
							<path
								fill="currentColor"
								d="M3 6h18v2H3V6Zm0 5h18v2H3v-2Zm0 5h18v2H3v-2Z"
							/>
						</svg>
					</button>

					<Link href="/" className="flex items-center gap-2">
						<span className="font-semibold text-lg text-black dark:text-white">
							GOSD CONSTRUCTOR
						</span>
					</Link>
				</div>

				<motion.ul
					className="hidden lg:flex items-center gap-1 mx-6 relative"
					variants={listVariants}
					initial="hidden"
					animate="show"
				>
					{items.map((item) => {
						const active = isActive(item.path);
						const isServicios = item.name === "Servicios";
						const isObras = item.name === "Obras";
						return (
							<motion.li
								key={item.name}
								variants={itemVariants}
								className="relative"
							>
								<div
									className="group relative"
									onMouseEnter={() => {
										if (isServicios) setServicesOpen(true);
										if (isObras) setObrasOpen(true);
									}}
									onMouseLeave={() => {
										if (isServicios) setServicesOpen(false);
										if (isObras) setObrasOpen(false);
									}}
									onFocus={() => {
										if (isServicios) setServicesOpen(true);
										if (isObras) setObrasOpen(true);
									}}
									onBlur={handleGroupBlur}
								>
									<Link
										href={item.path}
										className={`px-3 py-2 rounded-md text-sm transition-colors relative focus:outline-none focus:ring-2 focus:ring-black/20 dark:focus:ring-white/30
                      ${
												active
													? "text-black dark:text-white"
													: "text-black/70 dark:text-white/70 hover:text-black dark:hover:text-white"
											}`}
										aria-haspopup={isServicios || isObras ? "menu" : undefined}
										aria-expanded={
											isServicios
												? servicesOpen
												: isObras
												? obrasOpen
												: undefined
										}
										onClick={() => {
											setServicesOpen(false);
											setObrasOpen(false);
										}}
									>
										{item.name}
										{active && (
											<motion.span
												layoutId="nav-pill"
												className="absolute inset-0 -z-10 rounded-md bg-black/5 dark:bg-white/10"
												transition={{
													type: "spring",
													stiffness: 400,
													damping: 30,
												}}
											/>
										)}
									</Link>

									{isServicios && (
										<AnimatePresence>
											{servicesOpen && (
												<motion.div
													key="dropdown-servicios"
													role="menu"
													variants={dropdownVariants}
													initial="hidden"
													animate="show"
													exit="exit"
													className="absolute left-0 mt-2 w-[340px] rounded-lg border border-black/10 dark:border-white/10 bg-white dark:bg-black shadow-lg overflow-hidden"
												>
													<div className="p-2">
														{servicios.map((s) => {
															const sActive = isActive(s.path);
															return (
																<Link
																	key={s.name}
																	href={s.path}
																	className={`block rounded-md px-3 py-2 text-sm leading-tight transition-colors
                  ${
										sActive
											? "bg-black/5 dark:bg-white/10 text-black dark:text-white"
											: "text-black/80 dark:text-white/80 hover:bg-black/5 dark:hover:bg-white/10"
									}`}
																	onClick={() => {
																		setServicesOpen(false);
																		setObrasOpen(false);
																	}}
																>
																	<div className="font-medium">{s.name}</div>
																	{s.desc && (
																		<div className="text-xs opacity-70">
																			{s.desc}
																		</div>
																	)}
																</Link>
															);
														})}
													</div>
												</motion.div>
											)}
										</AnimatePresence>
									)}

									{isObras && (
										<AnimatePresence>
											{obrasOpen && (
												<motion.div
													key="dropdown-obras"
													role="menu"
													variants={dropdownVariants}
													initial="hidden"
													animate="show"
													exit="exit"
													className="absolute left-0 mt-2 w-[340px] rounded-lg border border-black/10 dark:border-white/10 bg-white dark:bg-black shadow-lg overflow-hidden"
												>
													<div className="p-2">
														{obras.map((o) => {
															const oActive = isActive(o.path);
															return (
																<Link
																	key={o.name}
																	href={o.path}
																	className={`block rounded-md px-3 py-2 text-sm leading-tight transition-colors
                  ${
										oActive
											? "bg-black/5 dark:bg-white/10 text-black dark:text-white"
											: "text-black/80 dark:text-white/80 hover:bg-black/5 dark:hover:bg-white/10"
									}`}
																	onClick={() => {
																		setObrasOpen(false);
																		setServicesOpen(false);
																	}}
																>
																	<div className="font-medium">{o.name}</div>
																	{o.desc && (
																		<div className="text-xs opacity-70">
																			{o.desc}
																		</div>
																	)}
																</Link>
															);
														})}
													</div>
												</motion.div>
											)}
										</AnimatePresence>
									)}
								</div>
							</motion.li>
						);
					})}
				</motion.ul>

				<motion.div
					className="ml-auto flex items-center gap-2"
					variants={listVariants}
					initial="hidden"
					animate="show"
				>
					<motion.div variants={itemVariants}>
						<Link
							href="/signin"
							className="inline-flex items-center rounded-md border border-black/15 dark:border-white/20 px-3 py-2 text-sm text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-black/20 dark:focus:ring-white/30"
							onClick={() => {
								setServicesOpen(false);
								setObrasOpen(false);
							}}
						>
							Iniciar sesión
						</Link>
					</motion.div>
					<motion.div variants={itemVariants} className="hidden md:block">
						<Link
							href="/signup"
							className="inline-flex items-center rounded-md border border-transparent px-3 py-2 text-sm text-white bg-black dark:bg-white/10 dark:text-white hover:bg-black/80 dark:hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-black/20 dark:focus:ring-white/30"
							onClick={() => {
								setServicesOpen(false);
								setObrasOpen(false);
							}}
						>
							Crear cuenta
						</Link>
					</motion.div>
				</motion.div>
			</nav>

			<AnimatePresence>
				{mobileOpen && (
					<motion.div
						key="mobile-panel"
						id="mobile-menu"
						variants={mobilePanelVariants}
						initial="hidden"
						animate="show"
						exit="exit"
						className="lg:hidden border-t border-black/10 dark:border-white/10 bg-white dark:bg-black"
					>
						<motion.ul
							variants={listVariants}
							initial="hidden"
							animate="show"
							className="px-4 py-2 space-y-1"
						>
							{items.map((item) => (
								<motion.li key={item.name} variants={itemVariants}>
									<Link
										href={item.path}
										className={`block w-full px-3 py-2 rounded-md text-sm
                      ${
												isActive(item.path)
													? "bg-black/5 dark:bg-white/10 text-black dark:text-white"
													: "text-black/80 dark:text-white/80 hover:bg-black/5 dark:hover:bg-white/10"
											}`}
										onClick={() => setMobileOpen(false)}
									>
										{item.name}
									</Link>

									{item.name === "Servicios" && (
										<motion.ul
											variants={listVariants}
											initial="hidden"
											animate="show"
											className="mt-1 mb-2 pl-2 space-y-1"
										>
											{servicios.map((s) => (
												<motion.li key={s.name} variants={itemVariants}>
													<Link
														href={s.path}
														className={`block w-full px-3 py-2 rounded-md text-sm
                              ${
																isActive(s.path)
																	? "bg-black/5 dark:bg-white/10 text-black dark:text-white"
																	: "text-black/80 dark:text-white/80 hover:bg-black/5 dark:hover:bg-white/10"
															}`}
														onClick={() => setMobileOpen(false)}
													>
														{s.name}
													</Link>
												</motion.li>
											))}
										</motion.ul>
									)}

									{item.name === "Obras" && (
										<motion.ul
											variants={listVariants}
											initial="hidden"
											animate="show"
											className="mt-1 mb-2 pl-2 space-y-1"
										>
											{obras.map((o) => (
												<motion.li key={o.name} variants={itemVariants}>
													<Link
														href={o.path}
														className={`block w-full px-3 py-2 rounded-md text-sm
                              ${
																isActive(o.path)
																	? "bg-black/5 dark:bg-white/10 text-black dark:text-white"
																	: "text-black/80 dark:text-white/80 hover:bg-black/5 dark:hover:bg-white/10"
															}`}
														onClick={() => setMobileOpen(false)}
													>
														{o.name}
													</Link>
												</motion.li>
											))}
										</motion.ul>
									)}
								</motion.li>
							))}

							<motion.li
								className="pt-2 flex items-center gap-2"
								variants={itemVariants}
							>
								<Link
									href="/signin"
									className="flex-1 inline-flex items-center justify-center rounded-md border border-black/15 dark:border-white/20 px-3 py-2 text-sm text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/10"
									onClick={() => setMobileOpen(false)}
								>
									Iniciar sesión
								</Link>
								<Link
									href="/signup"
									className="flex-1 inline-flex items-center justify-center rounded-md px-3 py-2 text-sm text-white bg-black dark:bg-white/10 dark:text-white hover:bg-black/80 dark:hover:bg-white/20"
									onClick={() => setMobileOpen(false)}
								>
									Crear cuenta
								</Link>
							</motion.li>
						</motion.ul>
					</motion.div>
				)}
			</AnimatePresence>
		</motion.header>
	);
};

export default Navbar;
