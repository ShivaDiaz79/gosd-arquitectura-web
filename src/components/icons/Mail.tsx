import { SVGProps } from "react";

export default function Mail(p: SVGProps<SVGSVGElement>) {
	return (
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...p}>
			<path
				strokeWidth="1.5"
				d="M3 7.5A2.5 2.5 0 015.5 5h13A2.5 2.5 0 0121 7.5v9A2.5 2.5 0 0118.5 19h-13A2.5 2.5 0 013 16.5v-9z"
			/>
			<path strokeWidth="1.5" d="M4 7l8 6 8-6" />
		</svg>
	);
}
