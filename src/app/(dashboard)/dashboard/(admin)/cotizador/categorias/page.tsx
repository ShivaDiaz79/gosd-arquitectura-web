"use client";
import FeesList from "@/components/fees/FeesList";

export default function FeesPage() {
	return (
		<div className="max-w-6xl">
			<FeesList pageSize={10} />
		</div>
	);
}
