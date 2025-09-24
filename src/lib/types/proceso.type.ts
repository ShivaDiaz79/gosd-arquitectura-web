export type ProcesoPaso = {
	n: string;
	t: string;
	d: string;
};

export type ProcesoContent = {
	title: string;
	steps: ProcesoPaso[];
};
