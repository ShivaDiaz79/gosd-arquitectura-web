"use client";

import PlansList from "@/components/plans/PlansList";

export default function PlansPage() {
	return (
		<div className="max-w-6xl">
			<PlansList pageSize={10} />
		</div>
	);
}
