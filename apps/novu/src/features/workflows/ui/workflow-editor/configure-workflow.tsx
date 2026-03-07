import { ConfigureWorkflowForm } from "@/features/workflows/components/workflow-editor/configure-workflow-form";
import { useWorkflow } from "@/features/workflows/components/workflow-editor/workflow-provider";

export function ConfigureWorkflow() {
	const { workflow, update } = useWorkflow();

	if (!workflow) {
		return null;
	}

	return <ConfigureWorkflowForm workflow={workflow} update={update} />;
}
