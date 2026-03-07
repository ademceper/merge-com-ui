import { Minus, Plus } from "@phosphor-icons/react";
import type { Registry, RJSFSchema } from "@rjsf/utils";
import { CompactButton } from "@/shared/ui/primitives/button-compact";

export const AddButton = (
	props: React.ButtonHTMLAttributes<HTMLButtonElement>,
) => {
	return (
		<CompactButton
			icon={Plus}
			variant="ghost"
			className="size-4 rounded-sm p-0.5"
			type="button"
			{...props}
			title="Add item"
		></CompactButton>
	);
};

export const RemoveButton = (
	props: React.ButtonHTMLAttributes<HTMLButtonElement> & {
		registry?: Registry<any, RJSFSchema, any>;
	},
) => {
	return (
		<CompactButton
			icon={Minus}
			variant="ghost"
			className="size-4 rounded-sm p-0.5"
			type="button"
			{...props}
			title="Remove item"
		></CompactButton>
	);
};
