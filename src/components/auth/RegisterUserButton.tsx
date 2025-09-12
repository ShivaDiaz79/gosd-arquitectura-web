"use client";
import { useState } from "react";
import RegisterUserModal from "@/components/auth/RegisterUserModal";

export default function RegisterUserButton() {
	const [open, setOpen] = useState(false);
	return (
		<>
			<button
				onClick={() => setOpen(true)}
				className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
			>
				Nuevo usuario
			</button>
			<RegisterUserModal isOpen={open} onClose={() => setOpen(false)} />
		</>
	);
}
