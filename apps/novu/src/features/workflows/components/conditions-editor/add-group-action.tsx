import { Button } from "@merge-rd/ui/components/button";
import type { ActionWithRulesAndAddersProps } from "react-querybuilder";
import { StackedPlusLine } from "@/components/icons/stacked-plus-line";

export const AddGroupAction = ({
	label,
	title,
	level,
	rules,
	handleOnClick,
	context,
}: ActionWithRulesAndAddersProps) => {
	if (level === 1 || (rules && rules.length >= 10)) {
		return null;
	}

	return (
		<Button
			mode="outline"
			variant="secondary"
			size="2xs"
			className="bg-transparent"
			onClick={(e) => {
				handleOnClick(e);
				context?.saveForm();
			}}
			leadingIcon={StackedPlusLine}
			title={title}
		>
			{label}
		</Button>
	);
};
