import { useEnvironment } from "@/app/context/environment/hooks";
import { ConfigureStepForm } from "@/pages/workflows/ui/workflow-editor/steps/configure-step-form";
import { useWorkflow } from "@/pages/workflows/ui/workflow-editor/workflow-provider";

export const ConfigureStep = () => {
	const { workflow, step, update } = useWorkflow();
	const { currentEnvironment } = useEnvironment();

	if (!currentEnvironment || !step || !workflow) {
		return null;
	}

	return (
		<ConfigureStepForm
			key={`${workflow.workflowId}-${step.stepId}`}
			workflow={workflow}
			step={step}
			environment={currentEnvironment}
			update={update}
		/>
	);
};
