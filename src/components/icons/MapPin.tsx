import { SVGProps } from "react";

export default function MapPin(p: SVGProps<SVGSVGElement>) {
	return (
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...p}>
			<path
				strokeWidth="1.5"
				d="M12 22s7-5.2 7-12a7 7 0 10-14 0c0 6.8 7 12 7 12z"
			/>
			<circle cx="12" cy="10" r="2.5" strokeWidth="1.5" />
		</svg>
	);
}
