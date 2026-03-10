import {
	Sidebar,
	SidebarContent,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@merge-rd/ui/components/sidebar";
import { Switcher, type SwitcherItem } from "@merge-rd/ui/components/switcher";
import { useTray } from "@merge-rd/ui/components/tray";
import { FeatureFlagsKeysEnum, PermissionsEnum } from "@/shared";
import {
	Broadcast,
	Buildings,
	ChartBar,
	ChartLine,
	ChatTeardropDots,

	Key,
	Layout,
	Path,
	Storefront,
	Terminal,
	Translate,
	UsersThree,
} from "@phosphor-icons/react";
import { Link, useLocation } from "@tanstack/react-router";
import { Badge } from "@/shared/ui/primitives/badge";
import { useEnvironment } from "@/app/context/environment/hooks";
import { useFeatureFlag } from "@/shared/lib/hooks/use-feature-flag";
import { Protect } from "@/shared/lib/protect";
import { buildRoute, ROUTES } from "@/shared/lib/routes";
import { OrganizationDropdown } from "./side-navigation/organization-dropdown";

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
					<Link to={to}>
						<Icon className="size-4" />
						<span>
							{label}
							{badgeLabel && (
								<>
									{" "}
									<Badge variant="secondary" className="text-xs">
										{badgeLabel}
									</Badge>
								</>
							)}
						</span>
					</Link>
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
	const { toggle } = useTray();
	const isWebhooksManagementEnabled = useFeatureFlag(
		FeatureFlagsKeysEnum.IS_WEBHOOKS_MANAGEMENT_ENABLED,
	);
	const isHttpLogsPageEnabled = useFeatureFlag(
		FeatureFlagsKeysEnum.IS_HTTP_LOGS_PAGE_ENABLED,
		false,
	);
	const isAnalyticsPageEnabled = useFeatureFlag(
		FeatureFlagsKeysEnum.IS_ANALYTICS_PAGE_ENABLED,
		false,
	);

	const { currentEnvironment, environments, switchEnvironment } =
		useEnvironment();

	const slug = currentEnvironment?.slug ?? "";

	const envItems: SwitcherItem[] = (environments ?? []).map((env) => ({
		value: env.name,
		label: env.name,
		description: env.slug,
		group: env._parentId ? "production" : undefined,
	}));

	const onEnvironmentChange = (value: string) => {
		const environment = environments?.find((env) => env.name === value);
		switchEnvironment(environment?.slug);
	};

	return (
		<Sidebar variant="inset" collapsible="offcanvas" {...props}>
			<SidebarHeader>
				<div className="flex w-full items-center justify-start group-data-[collapsible=icon]:hidden">
					<img
						src="/merge-black-text.svg"
						alt="Merge"
						className="h-8 w-full object-contain object-left dark:hidden"
					/>
					<img
						src="/merge-white-text.svg"
						alt="Merge"
						className="hidden h-8 w-full object-contain object-left dark:block"
					/>
				</div>
				<OrganizationDropdown />
				<Switcher
					value={currentEnvironment?.name}
					items={envItems}
					onChange={onEnvironmentChange}
					onManage={toggle}
				/>
			</SidebarHeader>

			<SidebarContent>
				{/* Main */}
				<SidebarGroup>
					<SidebarGroupContent>
						<SidebarMenu>
							<Protect permission={PermissionsEnum.WORKFLOW_READ}>
								<NovuNavLink
									to={
										slug
											? buildRoute(ROUTES.WORKFLOWS, { environmentSlug: slug })
											: undefined
									}
									icon={Path}
									label="Workflows"
								/>
							</Protect>
							<Protect permission={PermissionsEnum.WORKFLOW_READ}>
								<NovuNavLink
									to={
										slug
											? buildRoute(ROUTES.LAYOUTS, { environmentSlug: slug })
											: undefined
									}
									icon={Layout}
									label="Email Layouts"
								/>
							</Protect>
							<NovuNavLink
								to={
									slug
										? buildRoute(ROUTES.TRANSLATIONS, { environmentSlug: slug })
										: undefined
								}
								icon={Translate}
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
									to={
										slug
											? buildRoute(ROUTES.SUBSCRIBERS, {
													environmentSlug: slug,
												})
											: undefined
									}
									icon={UsersThree}
									label="Subscribers"
								/>
							</Protect>
							<Protect permission={PermissionsEnum.TOPIC_READ}>
								<NovuNavLink
									to={
										slug
											? buildRoute(ROUTES.TOPICS, { environmentSlug: slug })
											: undefined
									}
									icon={ChatTeardropDots}
									label="Topics"
								/>
							</Protect>
							<Protect permission={PermissionsEnum.WORKFLOW_READ}>
								<NovuNavLink
									to={
										slug
											? buildRoute(ROUTES.CONTEXTS, { environmentSlug: slug })
											: undefined
									}
									icon={Buildings}
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
												? buildRoute(
														isHttpLogsPageEnabled
															? ROUTES.ACTIVITY_WORKFLOW_RUNS
															: ROUTES.ACTIVITY_FEED,
														{
															environmentSlug: slug,
														},
													)
												: undefined
										}
										icon={ChartBar}
										label="Activity Feed"
									/>
								</Protect>
								{isAnalyticsPageEnabled && (
									<Protect permission={PermissionsEnum.NOTIFICATION_READ}>
										<NovuNavLink
											to={
												slug
													? buildRoute(ROUTES.ANALYTICS, {
															environmentSlug: slug,
														})
													: undefined
											}
											icon={ChartLine}
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
										to={
											slug
												? buildRoute(ROUTES.API_KEYS, { environmentSlug: slug })
												: undefined
										}
										icon={Key}
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
											to={
												slug
													? buildRoute(ROUTES.WEBHOOKS, {
															environmentSlug: slug,
														})
													: undefined
											}
											icon={Broadcast}
											label="Webhooks"
										/>
									</Protect>
								)}
								<Protect permission={PermissionsEnum.INTEGRATION_READ}>
									<NovuNavLink
										to={
											slug
												? buildRoute(ROUTES.INTEGRATIONS, {
														environmentSlug: slug,
													})
												: undefined
										}
										icon={Storefront}
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
