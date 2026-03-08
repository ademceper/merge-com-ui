import { createFileRoute, Outlet } from "@tanstack/react-router";
import { lazy } from "react";

const EditWorkflowPage = lazy(
	() => import("@/pages/workflows/ui/edit-workflow"),
);

function EditWorkflowLayout() {
	return (
		<EditWorkflowPage>
			<Outlet />
		</EditWorkflowPage>
	);
}

export const Route = createFileRoute(
	"/_dashboard/_fullpage/$environmentSlug/workflows/$workflowSlug",
)({
	component: EditWorkflowLayout,
});
