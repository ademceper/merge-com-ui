import { useParams } from "react-router-dom";
import { FullPageLayout } from "@/widgets/full-page-layout";
import { PageMeta } from "@/shared/ui/page-meta";
import { Toaster } from "@/shared/ui/primitives/sonner";
import { EditorBreadcrumbs } from "@/features/workflows/ui/workflow-editor/editor-breadcrumbs";
import { TestWorkflowTabs } from "@/features/workflows/ui/workflow-editor/test-workflow/test-workflow-tabs";
import { WorkflowProvider } from "@/features/workflows/ui/workflow-editor/workflow-provider";
import { useFetchWorkflow } from "@/features/workflows/lib/use-fetch-workflow";
import { useFetchWorkflowTestData } from "@/features/workflows/lib/use-fetch-workflow-test-data";

export const TestWorkflowPage = () => {
	const { workflowSlug = "" } = useParams<{
		environmentId: string;
		workflowSlug: string;
	}>();
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
