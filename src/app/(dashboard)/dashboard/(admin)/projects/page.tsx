"use client";
import ProjectsList from "@/components/projects/ProjectsList";

export default function ProjectsPage() {
	return (
		<div className="max-w-6xl">
			<h1 className="mb-4 text-xl font-semibold">Proyectos</h1>
			<ProjectsList pageSize={10} />
		</div>
	);
}
