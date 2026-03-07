import { ResourceOriginEnum } from "@/shared";
import { Compass, X } from "@phosphor-icons/react";
import { useNavigate } from "react-router-dom";
import { CompactButton } from "@/shared/ui/primitives/button-compact";
import { EditStepConditionsForm } from "@/features/workflows/ui/workflow-editor/steps/conditions/edit-step-conditions-form";
import { EditStepConditionsFormSkeleton } from "@/features/workflows/ui/workflow-editor/steps/conditions/edit-step-conditions-skeleton";
import { StepDrawer } from "@/features/workflows/ui/workflow-editor/steps/step-drawer";
import { useWorkflow } from "@/features/workflows/ui/workflow-editor/workflow-provider";

export const EditStepConditions = () => {
	const navigate = useNavigate();
	const { isPending, workflow, step } = useWorkflow();

	if (!workflow || !step) {
		return null;
	}

	const { uiSchema } = step.controls ?? {};
	const { skip } = uiSchema?.properties ?? {};

	if (!skip || workflow.origin !== ResourceOriginEnum.NOVU_CLOUD) {
		navigate("..", { relative: "path" });
		return null;
	}

	return (
		<StepDrawer
			title={`Edit ${step?.name} Conditions`}
			maxWidth="sm:max-w-[800px]"
		>
			<header className="flex h-12 w-full flex-row items-center justify-between gap-3 border-b py-4 pl-3 pr-3">
				<div className="mr-auto flex items-center gap-2.5 py-2 text-sm font-medium">
					<Compass weight="fill" className="size-4" />
					<span>Step Conditions</span>
				</div>

				<CompactButton
					icon={X}
					variant="ghost"
					className="size-6"
					onClick={(e) => {
						e.preventDefault();
						e.stopPropagation();
						navigate("..", { relative: "path" });
					}}
				>
					<span className="sr-only">Close</span>
				</CompactButton>
			</header>
			{isPending ? (
				<EditStepConditionsFormSkeleton />
			) : (
				<EditStepConditionsForm />
			)}
		</StepDrawer>
	);
};
