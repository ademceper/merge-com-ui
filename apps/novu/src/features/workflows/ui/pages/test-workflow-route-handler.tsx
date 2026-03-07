import { Navigate, useParams } from "react-router-dom";
import { TestWorkflowPage } from "@/features/workflows/pages/test-workflow";
import { buildRoute, ROUTES } from "@/utils/routes";

export const TestWorkflowRouteHandler = () => {
	const { environmentSlug, workflowSlug } = useParams<{
		environmentSlug: string;
		workflowSlug: string;
	}>();

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
