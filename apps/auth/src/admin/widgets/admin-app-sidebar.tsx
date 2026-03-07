import { label, useEnvironment } from "../../shared/keycloak-ui-shared";
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem
} from "@merge-rd/ui/components/sidebar";
import { Switcher, type SwitcherItem } from "@merge-rd/ui/components/switcher";
import { useTranslation } from "@merge-rd/i18n";
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { useAccess } from "../app/providers/access/access";
import { useRealm } from "../app/providers/realm-context/realm-context";
import { useServerInfo } from "../app/providers/server-info/server-info-provider";
import type { Environment } from "../app/environment";
import { toPage } from "../shared/lib/route-helpers-page";
import { routes } from "../app/routes";
import useIsFeatureEnabled, { Feature } from "../shared/lib/useIsFeatureEnabled";
import { useAdminClient } from "../app/admin-client";
import { fetchAdminUI } from "../app/providers/auth/admin-ui-endpoint";
import { toDashboard } from "../shared/lib/route-helpers";
import { useEffect, useState } from "react";
import type { RealmNameRepresentation } from "../app/providers/recent-realms";
import {
    BuildingsIcon,
    BrowserIcon,
    CirclesThreeIcon,
    ClockCounterClockwiseIcon,
    GearSixIcon,
    GlobeIcon,
    LockKeyIcon,
    ShieldCheckIcon,
    StackIcon,
    TreeStructureIcon,
    UsersIcon,
    UsersThreeIcon,
    KeyIcon,
    ArrowsClockwiseIcon,
    ListBulletsIcon
} from "@phosphor-icons/react";

const baseUrl = import.meta.env.BASE_URL;

type LeftNavProps = {
    title: string;
    path: string;
    icon: React.ComponentType<{ className?: string }>;
    id?: string;
};

function LeftNav({ title, path, icon: Icon, id }: LeftNavProps) {
    const { t } = useTranslation();
    const { hasAccess } = useAccess();
    const { realm } = useRealm();
    const location = useLocation();
    const encodedRealm = encodeURIComponent(realm);
    const route = routes.find(
        route => route.path.replace(/\/:.+?(\?|(?:(?!\/).)*|$)/g, "") === (id || path)
    );

    const accessAllowed =
        route &&
        (route.handle.access instanceof Array
            ? hasAccess(...route.handle.access)
            : hasAccess(route.handle.access));

    if (!accessAllowed) {
        return null;
    }

    const to = `/${encodedRealm}${path}`;
    const isActive = location.pathname === to || location.pathname.startsWith(to + "/");
    return (
        <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive} tooltip={t(title)}>
                <Link
                    to={to as string}
                    data-testid={"nav-item" + path.replace("/", "-")}
                >
                    <Icon className="size-4" />
                    <span>{t(title)}</span>
                </Link>
            </SidebarMenuButton>
        </SidebarMenuItem>
    );
}

export function AdminAppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { environment } = useEnvironment<Environment>();
    const { hasAccess, hasSomeAccess } = useAccess();
    const { componentTypes } = useServerInfo();
    const isFeatureEnabled = useIsFeatureEnabled();
    const pages = componentTypes?.["org.keycloak.services.ui.extend.UiPageProvider"];
    const { realm, realmRepresentation } = useRealm();
    const { adminClient } = useAdminClient();

    const [realms, setRealms] = useState<RealmNameRepresentation[]>([]);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const result = await fetchAdminUI<RealmNameRepresentation[]>(
                    adminClient,
                    "ui-ext/realms/names",
                    { first: "0", max: "1000" }
                );
                if (!cancelled) setRealms(result ?? []);
            } catch {
                if (!cancelled) setRealms([]);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [adminClient]);

    const realmItems: SwitcherItem[] = realms.map((r) => ({
        value: r.name,
        label: label(t, r.displayName, r.name) as string,
    }));

    const onRealmChange = (value: string) => {
        navigate({ to: toDashboard({ realm: value }) as string });
    };

    const showManage = hasSomeAccess(
        "view-realm",
        "query-groups",
        "query-users",
        "query-clients",
        "view-events"
    );

    const showConfigure = hasSomeAccess(
        "view-realm",
        "query-clients",
        "view-identity-providers"
    );

    const showWorkflows =
        hasAccess("manage-realm") && isFeatureEnabled(Feature.Workflows);

    const showManageRealm = environment.masterRealm === environment.realm;

    return (
        <Sidebar variant="inset" collapsible="offcanvas" {...props}>
            <SidebarHeader>
                <div className="flex w-full items-center justify-start pb-4 group-data-[collapsible=icon]:hidden">
                    <img
                        src={`${baseUrl}merge-black-text.svg`}
                        alt="Merge"
                        className="h-8 w-full object-contain object-left dark:hidden"
                    />
                    <img
                        src={`${baseUrl}merge-white-text.svg`}
                        alt="Merge"
                        className="hidden h-8 w-full object-contain object-left dark:block"
                    />
                </div>
                <Switcher value={realm} items={realmItems} onChange={onRealmChange} singleBadge={t("currentRealm")} />
            </SidebarHeader>
            <SidebarContent>
                {showManage && (
                    <SidebarGroup>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {isFeatureEnabled(Feature.Organizations) &&
                                    realmRepresentation?.organizationsEnabled && (
                                        <LeftNav
                                            title="organizations"
                                            path="/organizations"
                                            icon={BuildingsIcon}
                                        />
                                    )}
                                <LeftNav
                                    title="clients"
                                    path="/clients"
                                    icon={BrowserIcon}
                                />
                                <LeftNav
                                    title="clientScopes"
                                    path="/client-scopes"
                                    icon={StackIcon}
                                />
                                <LeftNav
                                    title="realmRoles"
                                    path="/roles"
                                    icon={KeyIcon}
                                />
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                )}

                {showManage && (
                    <SidebarGroup>
                        <SidebarGroupLabel>{t("usersAndAccess")}</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {hasAccess("query-users") && (
                                    <LeftNav
                                        title="titleUsers"
                                        path="/users"
                                        icon={UsersIcon}
                                    />
                                )}
                                <LeftNav
                                    title="groups"
                                    path="/groups"
                                    icon={UsersThreeIcon}
                                />
                                {isFeatureEnabled(Feature.AdminFineGrainedAuthzV2) &&
                                    realmRepresentation?.adminPermissionsEnabled && (
                                        <LeftNav
                                            title="permissions"
                                            path="/permissions"
                                            icon={ShieldCheckIcon}
                                        />
                                    )}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                )}

                {showConfigure && (
                    <SidebarGroup>
                        <SidebarGroupLabel>{t("security")}</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                <LeftNav
                                    title="authentication"
                                    path="/authentication"
                                    icon={LockKeyIcon}
                                />
                                <LeftNav
                                    title="identityProviders"
                                    path="/identity-providers"
                                    icon={GlobeIcon}
                                />
                                <LeftNav
                                    title="userFederation"
                                    path="/user-federation"
                                    icon={TreeStructureIcon}
                                />
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                )}

                {showManage && (
                    <SidebarGroup>
                        <SidebarGroupLabel>{t("monitor")}</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                <LeftNav
                                    title="sessions"
                                    path="/sessions"
                                    icon={ClockCounterClockwiseIcon}
                                />
                                {hasAccess("view-events") && (
                                    <LeftNav
                                        title="titleEvents"
                                        path="/events"
                                        icon={ListBulletsIcon}
                                    />
                                )}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                )}

                {showConfigure && hasAccess("view-realm") && (
                    <SidebarGroup>
                        <SidebarGroupLabel>{t("settings")}</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                <LeftNav
                                    title="realmSettings"
                                    path="/realm-settings"
                                    icon={GearSixIcon}
                                />
                                {showManageRealm && (
                                    <LeftNav
                                        title="manageRealms"
                                        path="/realms"
                                        icon={CirclesThreeIcon}
                                    />
                                )}
                                {showWorkflows && (
                                    <LeftNav
                                        title="workflows"
                                        path="/workflows"
                                        icon={ArrowsClockwiseIcon}
                                    />
                                )}
                                {isFeatureEnabled(Feature.DeclarativeUI) &&
                                    pages?.map(p => (
                                        <LeftNav
                                            key={p.id}
                                            title={p.id}
                                            path={toPage({ providerId: p.id })}
                                            icon={ListBulletsIcon}
                                            id="/page-section"
                                        />
                                    ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                )}
            </SidebarContent>
        </Sidebar>
    );
}
