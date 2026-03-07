import { cn } from "@merge-rd/ui/lib/utils";
import type { CombinatorSelectorProps } from "react-querybuilder";
import {
	Select,
	SelectContent,
	SelectTrigger,
	SelectValue,
} from "@/components/primitives/select";
import { toSelectOptions } from "@/features/workflows/components/conditions-editor/select-option-utils";

export const CombinatorSelector = ({
	disabled,
	value,
	options,
	handleOnChange,
	context,
}: CombinatorSelectorProps) => {
	return (
		<Select
			onValueChange={(e) => {
				handleOnChange(e);
				context?.saveForm();
			}}
			disabled={disabled}
			value={value}
		>
			<SelectTrigger
				size="2xs"
				className={cn(
					"w-18 hover:bg-bg-weak hover:text-text-strong text-label-xs gap-1",
				)}
			>
				<SelectValue />
			</SelectTrigger>
			<SelectContent className={cn("min-w-18 text-label-xs gap-1")}>
				{toSelectOptions(options)}
			</SelectContent>
		</Select>
	);
};
