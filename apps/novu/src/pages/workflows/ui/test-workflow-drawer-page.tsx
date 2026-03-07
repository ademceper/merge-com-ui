import { useState } from "react";
import { useNavigate, useParams } from "@tanstack/react-router";
import { TestWorkflowDrawer } from "@/pages/workflows/ui/workflow-editor/test-workflow/test-workflow-drawer";
import { useFetchWorkflowTestData } from "@/pages/workflows/api/use-fetch-workflow-test-data";

export function TestWorkflowDrawerPage() {
	const [open, setOpen] = useState(true);
	const navigate = useNavigate();
	const { workflowSlug } = useParams({ strict: false });

	const { testData } = useFetchWorkflowTestData({
		workflowSlug: workflowSlug ?? "",
	});

	const handleOpenChange = (isOpen: boolean) => {
		setOpen(isOpen);

		if (!isOpen) {
			window.history.back();
		}
	};

	return (
		<TestWorkflowDrawer
			isOpen={open}
			onOpenChange={handleOpenChange}
			testData={testData}
		/>
	);
}
