import type { RouteObject } from "react-router-dom";
import { lazy } from "react";
import { ROUTES } from "@/shared/lib/routes";

const WorkflowsPage = lazy(() =>
	import("@/features/workflows/ui/pages/workflows").then((m) => ({
		default: m.WorkflowsPage,
	})),
);
const TemplateModal = lazy(() =>
	import("@/features/workflows/ui/pages/workflows").then((m) => ({
		default: m.TemplateModal,
	})),
);
const CreateWorkflowPage = lazy(() =>
	import("@/features/workflows/ui/pages/create-workflow").then((m) => ({
		default: m.CreateWorkflowPage,
	})),
);
const DuplicateWorkflowPage = lazy(() =>
	import("@/features/workflows/ui/pages/duplicate-workflow").then((m) => ({
		default: m.DuplicateWorkflowPage,
	})),
);
const EditWorkflowPage = lazy(() =>
	import("@/features/workflows/ui/pages/edit-workflow").then((m) => ({
		default: m.EditWorkflowPage,
	})),
);
const EditStepTemplateV2Page = lazy(() =>
	import("@/features/workflows/ui/pages/edit-step-template-v2").then((m) => ({
		default: m.EditStepTemplateV2Page,
	})),
);
const TestWorkflowDrawerPage = lazy(() =>
	import("@/features/workflows/ui/pages/test-workflow-drawer-page").then(
		(m) => ({
			default: m.TestWorkflowDrawerPage,
		}),
	),
);
const TestWorkflowRouteHandler = lazy(() =>
	import("@/features/workflows/ui/pages/test-workflow-route-handler").then(
		(m) => ({
			default: m.TestWorkflowRouteHandler,
		}),
	),
);
const ConfigureWorkflow = lazy(() =>
	import(
		"@/features/workflows/ui/workflow-editor/configure-workflow"
	).then((m) => ({
		default: m.ConfigureWorkflow,
	})),
);
const ConfigureStep = lazy(() =>
	import(
		"@/features/workflows/ui/workflow-editor/steps/configure-step"
	).then((m) => ({
		default: m.ConfigureStep,
	})),
);
const EditStepConditions = lazy(() =>
	import(
		"@/features/workflows/ui/workflow-editor/steps/conditions/edit-step-conditions"
	).then((m) => ({
		default: m.EditStepConditions,
	})),
);
const ChannelPreferences = lazy(() =>
	import(
		"@/features/workflows/ui/workflow-editor/channel-preferences"
	).then((m) => ({
		default: m.ChannelPreferences,
	})),
);

export const workflowsDashboardRoutes: RouteObject = {
	path: ROUTES.WORKFLOWS,
	element: <WorkflowsPage />,
	children: [
		{
			path: ROUTES.TEMPLATE_STORE,
			element: <TemplateModal />,
		},
		{
			path: ROUTES.TEMPLATE_STORE_CREATE_WORKFLOW,
			element: <TemplateModal />,
		},
		{
			path: ROUTES.WORKFLOWS_CREATE,
			element: <CreateWorkflowPage />,
		},
		{
			path: ROUTES.WORKFLOWS_DUPLICATE,
			element: <DuplicateWorkflowPage />,
		},
	],
};

export const workflowsFullPageRoutes: RouteObject[] = [
	{
		path: ROUTES.EDIT_WORKFLOW,
		element: <EditWorkflowPage />,
		children: [
			{
				element: <ConfigureWorkflow />,
				index: true,
			},
			{
				element: <ConfigureStep />,
				path: ROUTES.EDIT_STEP,
			},
			{
				element: <EditStepTemplateV2Page />,
				path: ROUTES.EDIT_STEP_TEMPLATE,
			},
			{
				element: <EditStepConditions />,
				path: ROUTES.EDIT_STEP_CONDITIONS,
			},
			{
				element: <ChannelPreferences />,
				path: ROUTES.EDIT_WORKFLOW_PREFERENCES,
			},
			{
				path: ROUTES.TRIGGER_WORKFLOW,
				element: <TestWorkflowDrawerPage />,
			},
		],
	},
	{
		path: ROUTES.EDIT_WORKFLOW_ACTIVITY,
		element: <EditWorkflowPage />,
	},
	{
		path: ROUTES.TEST_WORKFLOW,
		element: <TestWorkflowRouteHandler />,
	},
];
