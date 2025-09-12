import { SVGProps } from "react";

export default function Phone(p: SVGProps<SVGSVGElement>) {
	return (
		<svg viewBox="0 0 24 24" fill="currentColor" {...p}>
			<path d="M6.6 10.8c1.2 2.3 3.1 4.2 5.4 5.4l1.8-1.8a1 1 0 011.1-.24c1.2.48 2.5.75 3.9.78a1 1 0 011 .99V20a1 1 0 01-1 1C10.5 21 3 13.5 3 4a1 1 0 011-1h4.1a1 1 0 011 .99c.03 1.35.3 2.7.78 3.9a1 1 0 01-.24 1.1L6.6 10.8z" />
		</svg>
	);
}
