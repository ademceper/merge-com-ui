import { FeatureFlagsKeysEnum } from "@novu/shared";
import { useParams } from "react-router-dom";
import { CreateWorkflowModal } from "@/features/workflows/components/create-workflow-modal";
import { NewWorkflowDrawer } from "@/features/workflows/pages/new-workflow-drawer";
import { useFeatureFlag } from "@/hooks/use-feature-flag";

export function DuplicateWorkflowPage() {
	const { workflowId } = useParams<{
		workflowId: string;
	}>();
	const isAiWorkflowGenerationEnabled = useFeatureFlag(
		FeatureFlagsKeysEnum.IS_AI_WORKFLOW_GENERATION_ENABLED,
	);
	if (isAiWorkflowGenerationEnabled) {
		return (
			<CreateWorkflowModal
				mode="duplicate"
				workflowId={workflowId ?? undefined}
			/>
		);
	}

	return (
		<NewWorkflowDrawer mode="duplicate" workflowId={workflowId ?? undefined} />
	);
}
