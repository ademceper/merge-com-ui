import { FeatureFlagsKeysEnum } from "@/shared";
import { CreateWorkflowModal } from "@/pages/workflows/ui/create-workflow-modal";
import { NewWorkflowDrawer } from "@/pages/workflows/ui/new-workflow-drawer";
import { useFeatureFlag } from "@/shared/lib/hooks/use-feature-flag";

export function CreateWorkflowPage() {
	const isAiWorkflowGenerationEnabled = useFeatureFlag(
		FeatureFlagsKeysEnum.IS_AI_WORKFLOW_GENERATION_ENABLED,
	);
	if (isAiWorkflowGenerationEnabled) {
		return <CreateWorkflowModal mode="create" />;
	}

	return <NewWorkflowDrawer mode="create" />;
}
