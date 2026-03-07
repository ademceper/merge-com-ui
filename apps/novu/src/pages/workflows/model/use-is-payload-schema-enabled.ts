import { ResourceOriginEnum } from "@/shared";
import { useWorkflow } from "@/pages/workflows/ui/workflow-editor/workflow-provider";

export function useIsPayloadSchemaEnabled(): boolean {
	const { workflow } = useWorkflow();

	return (
		workflow?.payloadSchema != null &&
		workflow.origin === ResourceOriginEnum.NOVU_CLOUD
	);
}
