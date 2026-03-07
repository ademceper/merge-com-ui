import { useEnvironment } from "@/context/environment/hooks";
import { ConfigureStepForm } from "@/features/workflows/components/workflow-editor/steps/configure-step-form";
import { useWorkflow } from "@/features/workflows/components/workflow-editor/workflow-provider";

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
