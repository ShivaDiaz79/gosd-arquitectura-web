"use client";

import { useState } from "react";
import { motion } from "framer-motion";

const Crane = () => {
  return (
    <motion.svg
      viewBox="0 0 300 180"
      className="w-full max-w-[420px] mx-auto"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      aria-hidden
    >
      <rect x="0" y="160" width="300" height="6" fill="currentColor" className="text-gray-300 dark:text-gray-700" />
      <rect x="40" y="40" width="10" height="120" rx="2" fill="currentColor" className="text-gray-500 dark:text-gray-400" />
      <path d="M40 60 L50 70 M50 60 L40 70 M40 80 L50 90 M50 80 L40 90 M40 100 L50 110 M50 100 L40 110 M40 120 L50 130 M50 120 L40 130" stroke="currentColor" className="text-gray-400 dark:text-gray-500" strokeWidth="2" />
      <rect x="50" y="50" width="150" height="6" rx="2" fill="currentColor" className="text-gray-500 dark:text-gray-400" />
      <motion.rect
        x="60" y="48" width="24" height="10" rx="2"
        fill="currentColor" className="text-gray-600 dark:text-gray-300"
        animate={{ x: [60, 160, 60] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.g
        style={{ originX: 135, originY: 55 }}
        animate={{ rotate: [-6, 6, -6] }}
        transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
      >
        <line x1="135" y1="55" x2="135" y2="110" stroke="currentColor" className="text-gray-500 dark:text-gray-400" strokeWidth="2" />
        <path d="M138 110 q-3 8 -6 0" fill="none" stroke="currentColor" className="text-gray-600 dark:text-gray-300" strokeWidth="2" />
        <rect x="123" y="118" width="24" height="18" rx="2" fill="currentColor" className="text-gray-400 dark:text-gray-500" />
      </motion.g>
      <g transform="translate(220, 140)">
        <rect x="0" y="10" width="40" height="8" rx="2" fill="#F59E0B" />
        <polygon points="20,0 35,10 5,10" fill="#F59E0B" />
        <rect x="12" y="4" width="16" height="3" fill="#fff" opacity="0.85" />
      </g>
    </motion.svg>
  );
};

const Gears = () => {
  return (
    <div className="flex items-center justify-center gap-6">
      <motion.svg viewBox="0 0 24 24" className="w-8 h-8 text-gray-500 dark:text-gray-400" aria-hidden
        animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 8, ease: "linear" }}>
        <path fill="currentColor" d="M10 2h4l.6 2.4 2.1.8 1.7-1.2 2.8 2.8-1.2 1.7.8 2.1L22 14v4l-2.4.6-.8 2.1 1.2 1.7-2.8 2.8-1.7-1.2-2.1.8L10 26H6l-.6-2.4-2.1-.8-1.7 1.2L-1.2 21 0 19.3l-.8-2.1L-2 14v-4l2.4-.6.8-2.1L0 5.6 2.8 2.8 4.5 4l2.1-.8L10 2Zm2 7a5 5 0 1 0 .001 10.001A5 5 0 0 0 12 9Z" />
      </motion.svg>
      <motion.svg viewBox="0 0 24 24" className="w-6 h-6 text-gray-400 dark:text-gray-500" aria-hidden
        animate={{ rotate: -360 }} transition={{ repeat: Infinity, duration: 6, ease: "linear" }}>
        <path fill="currentColor" d="M10 2h4l.6 2.4 2.1.8 1.7-1.2 2.8 2.8-1.2 1.7.8 2.1L22 14v4l-2.4.6-.8 2.1 1.2 1.7-2.8 2.8-1.7-1.2-2.1.8L10 26H6l-.6-2.4-2.1-.8-1.7 1.2L-1.2 21 0 19.3l-.8-2.1L-2 14v-4l2.4-.6.8-2.1L0 5.6 2.8 2.8 4.5 4l2.1-.8L10 2Zm2 7a5 5 0 1 0 .001 10.001A5 5 0 0 0 12 9Z" />
      </motion.svg>
    </div>
  );
};

const Progress = () => {
  return (
    <div className="w-full max-w-md mx-auto">
      <div className="h-2 w-full rounded-full bg-gray-200/70 dark:bg-gray-800/70 overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-brand-500 via-brand-600 to-brand-700"
          animate={{ width: ["10%", "35%", "60%", "85%", "95%"] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          style={{ borderRadius: 999 }}
        />
      </div>
      <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">Progreso de construcción (simulado)</p>
    </div>
  );
};

const UnderConstruction: React.FC = () => {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <section className="relative isolate overflow-hidden min-h-[100svh]">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-x-0 top-[-10%] h-[300px] bg-gradient-to-b from-brand-500/10 to-transparent blur-2xl" />
        <motion.div
          className="absolute -top-10 -right-16 size-[180px] rounded-full bg-brand-500/15"
          animate={{ y: [0, 10, 0], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-[-30px] -left-10 size-[220px] rounded-full bg-amber-500/10"
          animate={{ y: [0, -12, 0], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <motion.div
          className="mx-auto mb-6 w-fit rounded-full border border-amber-300/50 bg-amber-50/70 px-3 py-1 text-xs font-medium text-amber-700 shadow-sm dark:bg-amber-400/10 dark:text-amber-300"
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <span className="mr-1">🚧</span> Página en construcción
        </motion.div>

        <motion.h1
          className="text-center text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent dark:from-white dark:to-gray-300"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
        >
          Estamos preparando algo increíble
        </motion.h1>
        <motion.p
          className="mt-3 text-center text-sm sm:text-base text-gray-600 dark:text-gray-300"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          Mejoramos la experiencia para que, cuando entres, todo sea más rápido, claro y útil.
        </motion.p>

        <div className="mt-10">
          <Crane />
          <div className="mt-4">
            <Gears />
          </div>
        </div>

        <div className="mt-10">
          <Progress />
        </div>

        <div className="mt-12 grid sm:grid-cols-3 gap-4">
          {[
            { title: "Rendimiento", desc: "Optimización para carga rápida y navegación fluida." },
            { title: "Accesibilidad", desc: "Diseñada con buenas prácticas y soporte de teclado." },
            { title: "Modo oscuro", desc: "Interfaz adaptada a tu preferencia de tema." },
          ].map((f, i) => (
            <motion.div
              key={f.title}
              className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white/70 dark:bg-gray-900/60 p-4"
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.45, delay: i * 0.04 }}
            >
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{f.title}</h3>
              <p className="mt-1 text-xs text-gray-600 dark:text-gray-300">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default UnderConstruction;
