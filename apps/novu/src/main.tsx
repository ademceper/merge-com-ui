import '@merge/ui/globals.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';

import { ConfigureWorkflow } from '@/components/workflow-editor/configure-workflow';
import { EditStepConditions } from '@/components/workflow-editor/steps/conditions/edit-step-conditions';
import { ConfigureStep } from '@/components/workflow-editor/steps/configure-step';

import {
  ActivityFeed,
  AnalyticsPage,
  ApiKeysPage,
  CreateLayoutPage,
  CreateWorkflowPage,
  ErrorPage,
  IntegrationsListPage,
  LayoutsPage,
  SettingsPage,
  TemplateModal,
  TranslationsPage,
  WelcomePage,
  WorkflowsPage,
} from '@/pages';
import { DuplicateWorkflowPage } from '@/pages/duplicate-workflow';
import { EditStepTemplateV2Page } from '@/pages/edit-step-template-v2';
import { SubscribersPage } from '@/pages/subscribers';
import { TranslationSettingsPage } from '@/pages/translation-settings-page';
import { WebhooksPage } from '@/pages/webhooks-page';
import { CreateIntegrationSidebar } from './components/integrations/components/create-integration-sidebar';
import { UpdateIntegrationSidebar } from './components/integrations/components/update-integration-sidebar';
import { ChannelPreferences } from './components/workflow-editor/channel-preferences';
import { FeatureFlagsProvider } from './context/feature-flags-provider';
import { ContextsPage } from './pages/contexts';
import { CreateContextPage } from './pages/create-context';
import { CreateSubscriberPage } from './pages/create-subscriber';
import { CreateTopicPage } from './pages/create-topic';
import { DuplicateLayoutPage } from './pages/duplicate-layout-page';
import { EditContextPage } from './pages/edit-context';
import { EditLayoutPage } from './pages/edit-layout';
import { EditSubscriberPage } from './pages/edit-subscriber-page';
import { EditTopicPage } from './pages/edit-topic';
import { EditTranslationPage } from './pages/edit-translation';
import { EditWorkflowPage } from './pages/edit-workflow';
import { EnvironmentsPage } from './pages/environments';
import { InboxEmbedPage } from './pages/inbox-embed-page';
import { InboxEmbedSuccessPage } from './pages/inbox-embed-success-page';
import { InboxUsecasePage } from './pages/inbox-usecase-page';
import { TestWorkflowDrawerPage } from './pages/test-workflow-drawer-page';
import { TestWorkflowRouteHandler } from './pages/test-workflow-route-handler';
import { TopicsPage } from './pages/topics';
import { VercelIntegrationPage } from './pages/vercel-integration-page';
import { CatchAllRoute, DashboardRoute, RootRoute } from './routes';
import { OnboardingParentRoute } from './routes/onboarding';
import { ROUTES } from './utils/routes';
import { initializeSentry } from './utils/sentry';
import { overrideZodErrorMap } from './utils/validation';

initializeSentry();
overrideZodErrorMap();

const router = createBrowserRouter([
  {
    element: <RootRoute />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: '/onboarding',
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
                path: ROUTES.LAYOUTS_EDIT,
                element: <EditLayoutPage />,
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
                element: <Navigate to={ROUTES.WEBHOOKS_ENDPOINTS} replace />,
              },
              {
                path: '*',
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
            path: ROUTES.PARTNER_INTEGRATIONS_VERCEL,
            element: <VercelIntegrationPage />,
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
            path: '*',
            element: <CatchAllRoute />,
          },
        ],
      },
    ],
  },
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <FeatureFlagsProvider>
      <RouterProvider router={router} />
    </FeatureFlagsProvider>
  </StrictMode>
);
