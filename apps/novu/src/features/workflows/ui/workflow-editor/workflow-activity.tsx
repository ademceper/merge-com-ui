import { useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useEnvironment } from "@/app/context/environment/hooks";
import { ActivityFeedContent } from "@/features/activity/ui/activity-feed-content";
import { useWorkflow } from "@/features/workflows/ui/workflow-editor/workflow-provider";
import { buildRoute, ROUTES } from "@/shared/lib/routes";

export function WorkflowActivity() {
	const { workflow } = useWorkflow();
	const { currentEnvironment } = useEnvironment();
	const navigate = useNavigate();

	const initialFilters = useMemo(() => {
		if (!workflow?._id) return {};

		return {
			workflows: [workflow._id],
		};
	}, [workflow?._id]);

	const handleTriggerWorkflow = useCallback(() => {
		if (workflow?.slug && currentEnvironment?.slug) {
			navigate(
				buildRoute(ROUTES.TEST_WORKFLOW, {
					environmentSlug: currentEnvironment.slug,
					workflowSlug: workflow.slug,
				}),
			);
		}
	}, [workflow?.slug, currentEnvironment?.slug, navigate]);

	if (!workflow) {
		return (
			<div className="flex h-full items-center justify-center">
				<div className="text-foreground-600">Loading workflow...</div>
			</div>
		);
	}

	return (
		<ActivityFeedContent
			initialFilters={initialFilters}
			hideFilters={["workflows"]}
			className="h-full max-w-full"
			contentHeight="h-[calc(100%-50px)]"
			onTriggerWorkflow={handleTriggerWorkflow}
		/>
	);
}
