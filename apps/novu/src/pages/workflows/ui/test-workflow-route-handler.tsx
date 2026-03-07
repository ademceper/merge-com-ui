import { Navigate, useParams } from "@tanstack/react-router";
import { TestWorkflowPage } from "@/pages/workflows/ui/test-workflow";
import { buildRoute, ROUTES } from "@/shared/lib/routes";

export const TestWorkflowRouteHandler = () => {
	const { environmentSlug, workflowSlug } = useParams({ strict: false });

	if (environmentSlug && workflowSlug) {
		return (
			<Navigate
				to={buildRoute(ROUTES.TRIGGER_WORKFLOW, {
					environmentSlug,
					workflowSlug,
				})}
				replace
			/>
		);
	}

	return <TestWorkflowPage />;
};
