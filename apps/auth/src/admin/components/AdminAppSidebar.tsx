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
import { useTranslation } from "react-i18next";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAccess } from "../context/access/Access";
import { useRealm } from "../context/realm-context/RealmContext";
import { useServerInfo } from "../context/server-info/ServerInfoProvider";
import type { Environment } from "../environment";
import { toPage } from "../page/routes";
import { routes } from "../routes";
import useIsFeatureEnabled, { Feature } from "../utils/useIsFeatureEnabled";
import { useAdminClient } from "../admin-client";
import { fetchAdminUI } from "../context/auth/admin-ui-endpoint";
import { toDashboard } from "../dashboard/routes/Dashboard";
import { useEffect, useState } from "react";
import type { RealmNameRepresentation } from "../context/RecentRealms";
import {
    BuildingsIcon,
    BrowserIcon,
    CirclesThreeIcon,
    ClockCounterClockwiseIcon,
    GearSixIcon,
    GlobeSimple,
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
                <NavLink
                    to={to}
                    data-testid={"nav-item" + path.replace("/", "-")}
                    end={false}
                >
                    <Icon className="size-4" />
                    <span>{t(title)}</span>
                </NavLink>
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

    const realmColors = ["#6366f1", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6", "#06b6d4", "#ec4899", "#14b8a6"];

    const realmItems: SwitcherItem[] = realms.map((r, i) => ({
        value: r.name,
        label: label(t, r.displayName, r.name) as string,
        icon: <GlobeSimple weight="fill" className="size-5 rounded-md" style={{ color: realmColors[i % realmColors.length] }} />,
    }));

    const onRealmChange = (value: string) => {
        navigate(toDashboard({ realm: value }));
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
                <div className="flex w-full items-center justify-start px-2 pb-4 group-data-[collapsible=icon]:hidden">
                    <img
                        src={`${baseUrl}merge-black-text.svg`}
                        alt="Merge"
                        className="h-8 w-auto max-w-full object-contain object-left dark:hidden"
                    />
                    <img
                        src={`${baseUrl}merge-white-text.svg`}
                        alt="Merge"
                        className="hidden h-8 w-auto max-w-full object-contain object-left dark:block"
                    />
                </div>
                <Switcher value={realm} items={realmItems} onChange={onRealmChange} />
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
                                            path={toPage({ providerId: p.id }).pathname!}
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
