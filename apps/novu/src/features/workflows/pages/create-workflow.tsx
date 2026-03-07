import { FeatureFlagsKeysEnum } from "@novu/shared";
import { CreateWorkflowModal } from "@/features/workflows/components/create-workflow-modal";
import { NewWorkflowDrawer } from "@/features/workflows/pages/new-workflow-drawer";
import { useFeatureFlag } from "@/hooks/use-feature-flag";

export function CreateWorkflowPage() {
	const isAiWorkflowGenerationEnabled = useFeatureFlag(
		FeatureFlagsKeysEnum.IS_AI_WORKFLOW_GENERATION_ENABLED,
	);
	if (isAiWorkflowGenerationEnabled) {
		return <CreateWorkflowModal mode="create" />;
	}

	return <NewWorkflowDrawer mode="create" />;
}
