export type ProjectImage = {
	url: string;
	path: string;
	name?: string;
};

export type ProjectRow = {
	id: string;
	title: string;
	description: string;
	images: ProjectImage[];
	createdAt?: Date | null;
	updatedAt?: Date | null;
};
