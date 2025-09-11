"use client";

import React, { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

type Item = { name: string; path: string };

const Navbar: React.FC = () => {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const items: Item[] = useMemo(
    () => [
      { name: "Inicio", path: "/" },
      { name: "Servicios", path: "/servicios" },
      { name: "Precios", path: "/precios" },
      { name: "Blog", path: "/blog" },
      { name: "Contacto", path: "/contacto" },
    ],
    []
  );

  
  const isActive = useCallback(
    (p: string) => (p === "/" ? pathname === "/" : pathname.startsWith(p)),
    [pathname]
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur">
      <nav className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8 h-16 flex items-center">
        
        <div className="flex items-center gap-3">
          <button
            aria-label="Abrir menú"
            className="inline-flex items-center justify-center rounded-md border border-gray-200 dark:border-gray-700 px-2 py-1 lg:hidden"
            onClick={() => setMobileOpen((v) => !v)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" className="text-gray-700 dark:text-gray-200">
              <path fill="currentColor" d="M3 6h18v2H3V6Zm0 5h18v2H3v-2Zm0 5h18v2H3v-2Z" />
            </svg>
          </button>

          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              GOSD Arquitectos
            </span>
          </Link>
        </div>

        
        <ul className="hidden lg:flex items-center gap-2 mx-6">
          {items.map((item) => (
            <li key={item.name}>
              <Link
                href={item.path}
                className={`px-3 py-2 rounded-md text-sm transition-colors
                  ${
                    isActive(item.path)
                      ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100"
                  }`}
              >
                {item.name}
              </Link>
            </li>
          ))}
        </ul>

        
        <div className="ml-auto flex items-center gap-2">
          
          <Link
            href="/contacto"
            className="hidden sm:inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 dark:focus:ring-offset-gray-900"
          >
            Solicitar demo
          </Link>

          
          <Link
            href="/signin"
            className="inline-flex items-center rounded-md border border-gray-200 dark:border-gray-700 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            Iniciar sesión
          </Link>
          <Link
            href="/signup"
            className="hidden md:inline-flex items-center rounded-md border border-transparent px-3 py-2 text-sm text-white bg-gray-900 dark:bg-white/10 dark:text-white hover:bg-gray-700 dark:hover:bg-white/20"
          >
            Crear cuenta
          </Link>
        </div>
      </nav>

      
      {mobileOpen && (
        <div className="lg:hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <ul className="px-4 py-2 space-y-1">
            {items.map((item) => (
              <li key={item.name}>
                <Link
                  href={item.path}
                  className={`block w-full px-3 py-2 rounded-md text-sm
                    ${
                      isActive(item.path)
                        ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                        : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}
                  onClick={() => setMobileOpen(false)}
                >
                  {item.name}
                </Link>
              </li>
            ))}
            <li className="pt-2 flex items-center gap-2">
              <Link
                href="/signin"
                className="flex-1 inline-flex items-center justify-center rounded-md border border-gray-200 dark:border-gray-700 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={() => setMobileOpen(false)}
              >
                Iniciar sesión
              </Link>
              <Link
                href="/signup"
                className="flex-1 inline-flex items-center justify-center rounded-md px-3 py-2 text-sm text-white bg-gray-900 dark:bg-white/10 dark:text-white hover:bg-gray-700 dark:hover:bg-white/20"
                onClick={() => setMobileOpen(false)}
              >
                Crear cuenta
              </Link>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
};

export default Navbar;
