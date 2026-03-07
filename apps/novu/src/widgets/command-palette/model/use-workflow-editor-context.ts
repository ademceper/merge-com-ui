import { useLocation, useParams } from "@tanstack/react-router";
import { useFetchWorkflow } from "@/pages/workflows/api/use-fetch-workflow";

export function useWorkflowEditorContext() {
	const location = useLocation();
	const params = useParams({ strict: false }) as { workflowSlug?: string; stepSlug?: string };

	const isOnWorkflowEditorPath =
		location.pathname.includes("/workflows/") &&
		!location.pathname.includes("/workflows/create") &&
		!location.pathname.includes("/workflows/templates");

	const workflowSlug = params.workflowSlug;
	const isNewWorkflowSlug = workflowSlug === "new";
	const { workflow: fetchedWorkflow, isPending: fetchIsPending } =
		useFetchWorkflow({
			workflowSlug:
				isOnWorkflowEditorPath && !isNewWorkflowSlug ? workflowSlug : undefined,
		});

	const workflow = fetchedWorkflow;

	const isInWorkflowEditor = isOnWorkflowEditorPath;

	return {
		isInWorkflowEditor,
		workflow: isInWorkflowEditor ? workflow : undefined,
		isPending: fetchIsPending,
	};
}
