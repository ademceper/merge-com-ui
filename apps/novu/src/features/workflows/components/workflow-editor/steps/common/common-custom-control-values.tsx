import { PencilSimple, X } from "@phosphor-icons/react";
import { useNavigate } from "react-router-dom";
import { CompactButton } from "@/components/primitives/button-compact";
import { useWorkflow } from "@/features/workflows/components/workflow-editor/workflow-provider";
import { CustomStepControls } from "../controls/custom-step-controls";

export const CommonCustomControlValues = () => {
	const { step, workflow } = useWorkflow();
	const { dataSchema } = step?.controls ?? {};
	const navigate = useNavigate();

	if (!dataSchema || !workflow) {
		return null;
	}

	return (
		<>
			<header className="flex flex-row items-center gap-3 border-b border-b-neutral-200 p-3">
				<div className="mr-auto flex items-center gap-2.5 text-sm font-medium">
					<PencilSimple className="size-4" />
					<span>Configure Template</span>
				</div>
				<CompactButton
					icon={X}
					variant="ghost"
					onClick={(e) => {
						e.preventDefault();
						e.stopPropagation();
						navigate("../", { relative: "path" });
					}}
				>
					<span className="sr-only">Close</span>
				</CompactButton>
			</header>
			<CustomStepControls dataSchema={dataSchema} origin={workflow.origin} />
		</>
	);
};
