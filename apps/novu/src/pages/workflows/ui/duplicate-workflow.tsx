import { FeatureFlagsKeysEnum } from "@/shared";
import { useParams } from "@tanstack/react-router";
import { CreateWorkflowModal } from "@/pages/workflows/ui/create-workflow-modal";
import { NewWorkflowDrawer } from "@/pages/workflows/ui/new-workflow-drawer";
import { useFeatureFlag } from "@/shared/lib/hooks/use-feature-flag";

export function DuplicateWorkflowPage() {
	const { workflowId } = useParams({ strict: false });
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
