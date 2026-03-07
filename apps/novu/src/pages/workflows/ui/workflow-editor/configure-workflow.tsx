import { ConfigureWorkflowForm } from "@/pages/workflows/ui/workflow-editor/configure-workflow-form";
import { useWorkflow } from "@/pages/workflows/ui/workflow-editor/workflow-provider";

export function ConfigureWorkflow() {
	const { workflow, update } = useWorkflow();

	if (!workflow) {
		return null;
	}

	return <ConfigureWorkflowForm workflow={workflow} update={update} />;
}
