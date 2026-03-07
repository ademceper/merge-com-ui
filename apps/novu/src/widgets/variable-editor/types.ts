import type { LiquidVariable } from "@/shared/lib/parseStepVariables";

export type Filters = {
	label: string;
	value: string;
	hasParam?: boolean;
	description?: string;
	example?: string;
	sampleValue?: string;
	params?: {
		placeholder?: string;
		tip?: string;
		description?: string;
		type?: "string" | "number" | "variable";
		defaultValue?: string;
		label: string;
		required?: boolean;
	}[];
};

export type FilterWithParam = {
	value: string;
	params?: string[];
};

type VariablePopoverProps = {
	variable?: LiquidVariable;
	onEscapeKeyDown?: (event: KeyboardEvent) => void;
};
