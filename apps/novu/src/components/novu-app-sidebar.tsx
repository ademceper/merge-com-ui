import { FeatureFlagsKeysEnum, PermissionsEnum } from '@novu/shared';
import { NavLink, useLocation } from 'react-router-dom';
import {
  RiBarChartBoxLine,
  RiBuildingLine,
  RiDatabase2Line,
  RiDiscussLine,
  RiGroup2Line,
  RiKey2Line,
  RiLayout5Line,
  RiLineChartLine,
  RiRouteFill,
  RiSignalTowerLine,
  RiStore3Line,
  RiTranslate2,
} from 'react-icons/ri';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@merge-rd/ui/components/sidebar';
import { Badge } from '@/components/primitives/badge';
import { useEnvironment } from '@/context/environment/hooks';
import { useFeatureFlag } from '@/hooks/use-feature-flag';
import { Protect } from '@/utils/protect';
import { buildRoute, ROUTES } from '@/utils/routes';
import { EnvironmentDropdown } from './side-navigation/environment-dropdown';
import { OrganizationDropdown } from './side-navigation/organization-dropdown';

function NovuNavLink({
  to,
  icon: Icon,
  label,
  badge: badgeLabel,
}: {
  to?: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  badge?: string;
}) {
  const { pathname } = useLocation();
  const isActive = !!to && (pathname === to || pathname.startsWith(to));

  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={isActive} tooltip={label}>
        {to ? (
          <NavLink to={to}>
            <Icon className="size-4" />
            <span>
              {label}
              {badgeLabel && (
                <>
                  {' '}
                  <Badge variant="secondary" className="text-xs">
                    {badgeLabel}
                  </Badge>
                </>
              )}
            </span>
          </NavLink>
        ) : (
          <span>
            <Icon className="size-4" />
            <span>{label}</span>
          </span>
        )}
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

export function NovuAppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const isWebhooksManagementEnabled = useFeatureFlag(FeatureFlagsKeysEnum.IS_WEBHOOKS_MANAGEMENT_ENABLED);
  const isHttpLogsPageEnabled = useFeatureFlag(FeatureFlagsKeysEnum.IS_HTTP_LOGS_PAGE_ENABLED, false);
  const isAnalyticsPageEnabled = useFeatureFlag(FeatureFlagsKeysEnum.IS_ANALYTICS_PAGE_ENABLED, false);

  const { currentEnvironment, environments, switchEnvironment } = useEnvironment();

  const slug = currentEnvironment?.slug ?? '';

  const onEnvironmentChange = (value: string) => {
    const environment = environments?.find((env) => env.name === value);
    switchEnvironment(environment?.slug);
  };

  return (
    <Sidebar variant="inset" collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <OrganizationDropdown />
        <EnvironmentDropdown currentEnvironment={currentEnvironment} data={environments} onChange={onEnvironmentChange} />
      </SidebarHeader>

      <SidebarContent>
        {/* Main */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <Protect permission={PermissionsEnum.WORKFLOW_READ}>
                <NovuNavLink
                  to={slug ? buildRoute(ROUTES.WORKFLOWS, { environmentSlug: slug }) : undefined}
                  icon={RiRouteFill}
                  label="Workflows"
                />
              </Protect>
              <Protect permission={PermissionsEnum.WORKFLOW_READ}>
                <NovuNavLink
                  to={slug ? buildRoute(ROUTES.LAYOUTS, { environmentSlug: slug }) : undefined}
                  icon={RiLayout5Line}
                  label="Email Layouts"
                />
              </Protect>
              <NovuNavLink
                to={slug ? buildRoute(ROUTES.TRANSLATIONS, { environmentSlug: slug }) : undefined}
                icon={RiTranslate2}
                label="Translations"
                badge="BETA"
              />
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Data */}
        <SidebarGroup>
          <SidebarGroupLabel>Data</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <Protect permission={PermissionsEnum.SUBSCRIBER_READ}>
                <NovuNavLink
                  to={slug ? buildRoute(ROUTES.SUBSCRIBERS, { environmentSlug: slug }) : undefined}
                  icon={RiGroup2Line}
                  label="Subscribers"
                />
              </Protect>
              <Protect permission={PermissionsEnum.TOPIC_READ}>
                <NovuNavLink
                  to={slug ? buildRoute(ROUTES.TOPICS, { environmentSlug: slug }) : undefined}
                  icon={RiDiscussLine}
                  label="Topics"
                />
              </Protect>
              <Protect permission={PermissionsEnum.WORKFLOW_READ}>
                <NovuNavLink
                  to={slug ? buildRoute(ROUTES.CONTEXTS, { environmentSlug: slug }) : undefined}
                  icon={RiBuildingLine}
                  label="Contexts"
                  badge="BETA"
                />
              </Protect>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Monitor */}
        <Protect permission={PermissionsEnum.NOTIFICATION_READ}>
          <SidebarGroup>
            <SidebarGroupLabel>Monitor</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <Protect permission={PermissionsEnum.NOTIFICATION_READ}>
                  <NovuNavLink
                    to={
                      slug
                        ? buildRoute(isHttpLogsPageEnabled ? ROUTES.ACTIVITY_WORKFLOW_RUNS : ROUTES.ACTIVITY_FEED, {
                            environmentSlug: slug,
                          })
                        : undefined
                    }
                    icon={RiBarChartBoxLine}
                    label="Activity Feed"
                  />
                </Protect>
                {isAnalyticsPageEnabled && (
                  <Protect permission={PermissionsEnum.NOTIFICATION_READ}>
                    <NovuNavLink
                      to={slug ? buildRoute(ROUTES.ANALYTICS, { environmentSlug: slug }) : undefined}
                      icon={RiLineChartLine}
                      label="Usage"
                    />
                  </Protect>
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </Protect>

        {/* Developer */}
        <Protect
          condition={(has) =>
            has({ permission: PermissionsEnum.API_KEY_READ }) ||
            has({ permission: PermissionsEnum.INTEGRATION_READ }) ||
            has({ permission: PermissionsEnum.WEBHOOK_READ }) ||
            has({ permission: PermissionsEnum.WEBHOOK_WRITE })
          }
        >
          <SidebarGroup>
            <SidebarGroupLabel>Developer</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <Protect permission={PermissionsEnum.API_KEY_READ}>
                  <NovuNavLink
                    to={slug ? buildRoute(ROUTES.API_KEYS, { environmentSlug: slug }) : undefined}
                    icon={RiKey2Line}
                    label="API Keys"
                  />
                </Protect>
                {isWebhooksManagementEnabled && (
                  <Protect
                    condition={(has) =>
                      has({ permission: PermissionsEnum.WEBHOOK_READ }) ||
                      has({ permission: PermissionsEnum.WEBHOOK_WRITE })
                    }
                  >
                    <NovuNavLink
                      to={slug ? buildRoute(ROUTES.WEBHOOKS, { environmentSlug: slug }) : undefined}
                      icon={RiSignalTowerLine}
                      label="Webhooks"
                    />
                  </Protect>
                )}
                <NovuNavLink
                  to={slug ? buildRoute(ROUTES.ENVIRONMENTS, { environmentSlug: slug }) : undefined}
                  icon={RiDatabase2Line}
                  label="Environments"
                />
                <Protect permission={PermissionsEnum.INTEGRATION_READ}>
                  <NovuNavLink
                    to={slug ? buildRoute(ROUTES.INTEGRATIONS, { environmentSlug: slug }) : undefined}
                    icon={RiStore3Line}
                    label="Integration Store"
                  />
                </Protect>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </Protect>

      </SidebarContent>
    </Sidebar>
  );
}
