import { Question, Textbox } from "@phosphor-icons/react";
import type { ComponentProps } from "react";
import { Link } from "react-router-dom";
import { FormRoot } from "@/shared/ui/primitives/form/form";
import {
	Panel,
	PanelContent,
	PanelHeader,
} from "@/shared/ui/primitives/panel";

type EditStepConditionsLayoutProps = ComponentProps<typeof FormRoot> & {
	stepName?: string;
	children: React.ReactNode;
	disabled?: boolean;
};

export const EditStepConditionsLayout = (
	props: EditStepConditionsLayoutProps,
) => {
	const { stepName, children, ...rest } = props;

	return (
		<FormRoot className="flex h-full flex-col overflow-hidden" {...rest}>
			<div className="flex flex-col gap-3 overflow-y-auto overflow-x-hidden px-3 py-5">
				<Panel className="overflow-initial">
					<PanelHeader>
						<Textbox className="text-feature size-4" />
						<span className="text-neutral-950">
							Step conditions for — {stepName}
						</span>
					</PanelHeader>
					<PanelContent className="flex flex-col gap-2 border-solid">
						{children}
					</PanelContent>
				</Panel>
				<Link
					target="_blank"
					to={"https://docs.novu.co/platform/workflow/step-conditions"}
					className="mt-2 flex w-max items-center gap-1 text-xs text-neutral-600 hover:underline"
				>
					<Question className="size-4" /> Learn more about conditional step
					execution
				</Link>
			</div>
		</FormRoot>
	);
};
