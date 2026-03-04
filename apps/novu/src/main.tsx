import "@merge/ui/globals.css";
import { lazy, StrictMode } from "react";
import { createRoot } from "react-dom/client";
import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";

import { KeycloakProvider } from "@merge/auth";
import { ErrorPage } from "@/pages/error-page";
import { CatchAllRoute, DashboardRoute, RootRoute } from "./routes";
import { DashboardLayoutRoute } from "./routes/dashboard-layout-route";
import { FullPageLayoutRoute } from "./routes/full-page-layout-route";
import { OnboardingParentRoute } from "./routes/onboarding";
import { FeatureFlagsProvider } from "./context/feature-flags-provider";
import { ROUTES } from "./utils/routes";
import { initializeSentry } from "./utils/sentry";
import { overrideZodErrorMap } from "./utils/validation";

// Lazy-loaded pages
const ActivityFeed = lazy(() =>
  import("@/pages/activity-feed").then((m) => ({ default: m.ActivityFeed })),
);
const AnalyticsPage = lazy(() =>
  import("@/pages/analytics").then((m) => ({ default: m.AnalyticsPage })),
);
const ApiKeysPage = lazy(() =>
  import("@/pages/api-keys").then((m) => ({ default: m.ApiKeysPage })),
);
const CreateLayoutPage = lazy(() =>
  import("@/pages/create-layout").then((m) => ({
    default: m.CreateLayoutPage,
  })),
);
const CreateWorkflowPage = lazy(() =>
  import("@/pages/create-workflow").then((m) => ({
    default: m.CreateWorkflowPage,
  })),
);
const IntegrationsListPage = lazy(() =>
  import("@/pages/integrations-list-page").then((m) => ({
    default: m.IntegrationsListPage,
  })),
);
const LayoutsPage = lazy(() =>
  import("@/pages/layouts").then((m) => ({ default: m.LayoutsPage })),
);
const SettingsPage = lazy(() =>
  import("@/pages/settings").then((m) => ({ default: m.SettingsPage })),
);
const TemplateModal = lazy(() =>
  import("@/pages/workflows").then((m) => ({ default: m.TemplateModal })),
);
const TranslationsPage = lazy(() =>
  import("@/pages/translations").then((m) => ({ default: m.TranslationsPage })),
);
const WelcomePage = lazy(() =>
  import("@/pages/welcome-page").then((m) => ({ default: m.WelcomePage })),
);
const WorkflowsPage = lazy(() =>
  import("@/pages/workflows").then((m) => ({ default: m.WorkflowsPage })),
);
const DuplicateWorkflowPage = lazy(() =>
  import("@/pages/duplicate-workflow").then((m) => ({
    default: m.DuplicateWorkflowPage,
  })),
);
const EditStepTemplateV2Page = lazy(() =>
  import("@/pages/edit-step-template-v2").then((m) => ({
    default: m.EditStepTemplateV2Page,
  })),
);
const SubscribersPage = lazy(() =>
  import("@/pages/subscribers").then((m) => ({ default: m.SubscribersPage })),
);
const TranslationSettingsPage = lazy(() =>
  import("@/pages/translation-settings-page").then((m) => ({
    default: m.TranslationSettingsPage,
  })),
);
const WebhooksPage = lazy(() =>
  import("@/pages/webhooks-page").then((m) => ({ default: m.WebhooksPage })),
);
const ContextsPage = lazy(() =>
  import("@/pages/contexts").then((m) => ({ default: m.ContextsPage })),
);
const CreateContextPage = lazy(() =>
  import("@/pages/create-context").then((m) => ({
    default: m.CreateContextPage,
  })),
);
const CreateSubscriberPage = lazy(() =>
  import("@/pages/create-subscriber").then((m) => ({
    default: m.CreateSubscriberPage,
  })),
);
const CreateTopicPage = lazy(() =>
  import("@/pages/create-topic").then((m) => ({ default: m.CreateTopicPage })),
);
const DuplicateLayoutPage = lazy(() =>
  import("@/pages/duplicate-layout-page").then((m) => ({
    default: m.DuplicateLayoutPage,
  })),
);
const EditContextPage = lazy(() =>
  import("@/pages/edit-context").then((m) => ({ default: m.EditContextPage })),
);
const EditLayoutPage = lazy(() =>
  import("@/pages/edit-layout").then((m) => ({ default: m.EditLayoutPage })),
);
const EditSubscriberPage = lazy(() =>
  import("@/pages/edit-subscriber-page").then((m) => ({
    default: m.EditSubscriberPage,
  })),
);
const EditTopicPage = lazy(() =>
  import("@/pages/edit-topic").then((m) => ({ default: m.EditTopicPage })),
);
const EditTranslationPage = lazy(() =>
  import("@/pages/edit-translation").then((m) => ({
    default: m.EditTranslationPage,
  })),
);
const EditWorkflowPage = lazy(() =>
  import("@/pages/edit-workflow").then((m) => ({
    default: m.EditWorkflowPage,
  })),
);
const EnvironmentsPage = lazy(() =>
  import("@/pages/environments").then((m) => ({ default: m.EnvironmentsPage })),
);
const InboxEmbedPage = lazy(() =>
  import("@/pages/inbox-embed-page").then((m) => ({
    default: m.InboxEmbedPage,
  })),
);
const InboxEmbedSuccessPage = lazy(() =>
  import("@/pages/inbox-embed-success-page").then((m) => ({
    default: m.InboxEmbedSuccessPage,
  })),
);
const InboxUsecasePage = lazy(() =>
  import("@/pages/inbox-usecase-page").then((m) => ({
    default: m.InboxUsecasePage,
  })),
);
const TestWorkflowDrawerPage = lazy(() =>
  import("@/pages/test-workflow-drawer-page").then((m) => ({
    default: m.TestWorkflowDrawerPage,
  })),
);
const TestWorkflowRouteHandler = lazy(() =>
  import("@/pages/test-workflow-route-handler").then((m) => ({
    default: m.TestWorkflowRouteHandler,
  })),
);
const TopicsPage = lazy(() =>
  import("@/pages/topics").then((m) => ({ default: m.TopicsPage })),
);
const VercelIntegrationPage = lazy(() =>
  import("@/pages/vercel-integration-page").then((m) => ({
    default: m.VercelIntegrationPage,
  })),
);

// Lazy-loaded components
const ConfigureWorkflow = lazy(() =>
  import("@/components/workflow-editor/configure-workflow").then((m) => ({
    default: m.ConfigureWorkflow,
  })),
);
const ConfigureStep = lazy(() =>
  import("@/components/workflow-editor/steps/configure-step").then((m) => ({
    default: m.ConfigureStep,
  })),
);
const EditStepConditions = lazy(() =>
  import(
    "@/components/workflow-editor/steps/conditions/edit-step-conditions"
  ).then((m) => ({
    default: m.EditStepConditions,
  })),
);
const ChannelPreferences = lazy(() =>
  import("@/components/workflow-editor/channel-preferences").then((m) => ({
    default: m.ChannelPreferences,
  })),
);
const CreateIntegrationSidebar = lazy(() =>
  import(
    "@/components/integrations/components/create-integration-sidebar"
  ).then((m) => ({
    default: m.CreateIntegrationSidebar,
  })),
);
const UpdateIntegrationSidebar = lazy(() =>
  import(
    "@/components/integrations/components/update-integration-sidebar"
  ).then((m) => ({
    default: m.UpdateIntegrationSidebar,
  })),
);

initializeSentry();
overrideZodErrorMap();

const router = createBrowserRouter([
  {
    element: <RootRoute />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "/onboarding",
        element: <OnboardingParentRoute />,
        children: [
          {
            path: ROUTES.INBOX_USECASE,
            element: <InboxUsecasePage />,
          },
          {
            path: ROUTES.INBOX_EMBED,
            element: <InboxEmbedPage />,
          },
          {
            path: ROUTES.INBOX_EMBED_SUCCESS,
            element: <InboxEmbedSuccessPage />,
          },
        ],
      },
      {
        path: ROUTES.ROOT,
        element: <DashboardRoute />,
        children: [
          // Sidebar layout pages
          {
            element: <DashboardLayoutRoute />,
            children: [
              {
                index: true,
                element: <CatchAllRoute />,
              },
              {
                path: ROUTES.ENV,
                children: [
                  {
                    path: ROUTES.WELCOME,
                    element: <WelcomePage />,
                  },
                  {
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
                  },
                  {
                    path: ROUTES.SUBSCRIBERS,
                    element: <SubscribersPage />,
                    children: [
                      {
                        path: ROUTES.EDIT_SUBSCRIBER,
                        element: <EditSubscriberPage />,
                      },
                      {
                        path: ROUTES.CREATE_SUBSCRIBER,
                        element: <CreateSubscriberPage />,
                      },
                    ],
                  },
                  {
                    path: ROUTES.TOPICS,
                    element: <TopicsPage />,
                    children: [
                      {
                        path: ROUTES.TOPICS_CREATE,
                        element: <CreateTopicPage />,
                      },
                      {
                        path: ROUTES.TOPICS_EDIT,
                        element: <EditTopicPage />,
                      },
                    ],
                  },
                  {
                    path: ROUTES.CONTEXTS,
                    element: <ContextsPage />,
                    children: [
                      {
                        path: ROUTES.CONTEXTS_CREATE,
                        element: <CreateContextPage />,
                      },
                      {
                        path: ROUTES.CONTEXTS_EDIT,
                        element: <EditContextPage />,
                      },
                    ],
                  },
                  {
                    path: ROUTES.LAYOUTS,
                    element: <LayoutsPage />,
                    children: [
                      {
                        path: ROUTES.LAYOUTS_CREATE,
                        element: <CreateLayoutPage />,
                      },
                      {
                        path: ROUTES.LAYOUTS_DUPLICATE,
                        element: <DuplicateLayoutPage />,
                      },
                    ],
                  },
                  {
                    path: ROUTES.TRANSLATIONS,
                    element: <TranslationsPage />,
                    children: [
                      {
                        path: ROUTES.TRANSLATION_SETTINGS,
                        element: <TranslationSettingsPage />,
                      },
                      {
                        path: ROUTES.TRANSLATIONS_EDIT,
                        element: <EditTranslationPage />,
                      },
                    ],
                  },
                  {
                    path: ROUTES.API_KEYS,
                    element: <ApiKeysPage />,
                  },
                  {
                    path: ROUTES.ENVIRONMENTS,
                    element: <EnvironmentsPage />,
                  },
                  {
                    path: ROUTES.ACTIVITY_FEED,
                    element: <ActivityFeed />,
                  },
                  {
                    path: ROUTES.ACTIVITY_WORKFLOW_RUNS,
                    element: <ActivityFeed />,
                  },
                  {
                    path: ROUTES.ACTIVITY_REQUESTS,
                    element: <ActivityFeed />,
                  },
                  {
                    path: ROUTES.ANALYTICS,
                    element: <AnalyticsPage />,
                  },
                  {
                    path: ROUTES.WEBHOOKS_ENDPOINTS,
                    element: <WebhooksPage />,
                  },
                  {
                    path: ROUTES.WEBHOOKS_EVENT_CATALOG,
                    element: <WebhooksPage />,
                  },
                  {
                    path: ROUTES.WEBHOOKS_LOGS,
                    element: <WebhooksPage />,
                  },
                  {
                    path: ROUTES.WEBHOOKS_ACTIVITY,
                    element: <WebhooksPage />,
                  },
                  {
                    path: ROUTES.WEBHOOKS,
                    element: (
                      <Navigate to={ROUTES.WEBHOOKS_ENDPOINTS} replace />
                    ),
                  },
                  {
                    path: "*",
                    element: <CatchAllRoute />,
                  },
                ],
              },
              {
                path: ROUTES.INTEGRATIONS,
                element: <IntegrationsListPage />,
                children: [
                  {
                    path: ROUTES.INTEGRATIONS_CONNECT,
                    element: <CreateIntegrationSidebar isOpened />,
                  },
                  {
                    path: ROUTES.INTEGRATIONS_CONNECT_PROVIDER,
                    element: <CreateIntegrationSidebar isOpened />,
                  },
                  {
                    path: ROUTES.INTEGRATIONS_UPDATE,
                    element: <UpdateIntegrationSidebar isOpened />,
                  },
                ],
              },
              {
                path: ROUTES.SETTINGS,
                element: <SettingsPage />,
              },
              {
                path: ROUTES.SETTINGS_ACCOUNT,
                element: <SettingsPage />,
              },
              {
                path: ROUTES.SETTINGS_ORGANIZATION,
                element: <SettingsPage />,
              },
              {
                path: ROUTES.SETTINGS_TEAM,
                element: <SettingsPage />,
              },
              {
                path: ROUTES.SETTINGS_BILLING,
                element: <SettingsPage />,
              },
              {
                path: "*",
                element: <CatchAllRoute />,
              },
            ],
          },
          // Full-page layout (no sidebar)
          {
            element: <FullPageLayoutRoute />,
            children: [
              {
                path: ROUTES.ENV,
                children: [
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
                  {
                    path: ROUTES.LAYOUTS_EDIT,
                    element: <EditLayoutPage />,
                  },
                ],
              },
              {
                path: ROUTES.PARTNER_INTEGRATIONS_VERCEL,
                element: <VercelIntegrationPage />,
              },
            ],
          },
        ],
      },
    ],
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <KeycloakProvider
      issuerUri={import.meta.env.VITE_OIDC_ISSUER_URI}
      clientId={import.meta.env.VITE_OIDC_CLIENT_ID}
      fallback={
        <div className="flex h-svh items-center justify-center">Loading...</div>
      }
    >
      <FeatureFlagsProvider>
        <RouterProvider router={router} />
      </FeatureFlagsProvider>
    </KeycloakProvider>
  </StrictMode>,
);
