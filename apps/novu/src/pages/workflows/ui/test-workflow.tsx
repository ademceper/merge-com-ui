import { useParams } from "@tanstack/react-router";
import { FullPageLayout } from "@/widgets/full-page-layout";
import { PageMeta } from "@/shared/ui/page-meta";
import { Toaster } from "@/shared/ui/primitives/sonner";
import { EditorBreadcrumbs } from "@/pages/workflows/ui/workflow-editor/editor-breadcrumbs";
import { TestWorkflowTabs } from "@/pages/workflows/ui/workflow-editor/test-workflow/test-workflow-tabs";
import { WorkflowProvider } from "@/pages/workflows/ui/workflow-editor/workflow-provider";
import { useFetchWorkflow } from "@/pages/workflows/api/use-fetch-workflow";
import { useFetchWorkflowTestData } from "@/pages/workflows/api/use-fetch-workflow-test-data";

export const TestWorkflowPage = () => {
	const { workflowSlug = "" } = useParams({ strict: false });
	const { workflow } = useFetchWorkflow({
		workflowSlug,
	});
	const { testData } = useFetchWorkflowTestData({ workflowSlug });

	return (
		<>
			<PageMeta title={`Trigger ${workflow?.name}`} />
			<WorkflowProvider>
				<FullPageLayout headerStartItems={<EditorBreadcrumbs />}>
					<TestWorkflowTabs testData={testData} />
					<Toaster />
				</FullPageLayout>
			</WorkflowProvider>
		</>
	);
};
