/* eslint-disable */
// @ts-nocheck

import type { KeycloakTokenParsed } from "oidc-spa/keycloak-js";
import type { TFunction } from "i18next";
import { label, useEnvironment } from "../../shared/keycloak-ui-shared";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem
} from "@merge/ui/components/sidebar";
import { useTranslation } from "react-i18next";
import { NavLink, useLocation } from "react-router-dom";
import { useAccess } from "../context/access/Access";
import { useRealm } from "../context/realm-context/RealmContext";
import { useServerInfo } from "../context/server-info/ServerInfoProvider";
import type { Environment } from "../environment";
import type { UserMenuInfo } from "../PageHeader";
import { toPage } from "../page/routes";
import { routes } from "../routes";
import useIsFeatureEnabled, { Feature } from "../utils/useIsFeatureEnabled";
import { AdminNavUser } from "./AdminNavUser";

function loggedInUserName(token: KeycloakTokenParsed | undefined, t: TFunction) {
    if (!token) return t("unknownUser");
    const givenName = token.given_name;
    const familyName = token.family_name;
    const preferredUsername = token.preferred_username;
    if (givenName && familyName) return t("fullName", { givenName, familyName });
    return givenName || familyName || preferredUsername || t("unknownUser");
}

function avatarInitials(token: KeycloakTokenParsed | undefined): string {
    if (!token) return "?";
    const given = token.given_name?.[0] ?? "";
    const family = token.family_name?.[0] ?? "";
    if (given || family) return `${given}${family}`.toUpperCase();
    const preferred = token.preferred_username?.[0];
    return preferred ? preferred.toUpperCase() : "?";
}

function userEmailFromToken(token: KeycloakTokenParsed | undefined): string {
    if (!token) return "";
    return (token as { email?: string }).email ?? token.preferred_username ?? "";
}

type LeftNavProps = {
    title: string;
    path: string;
    id?: string;
};

function LeftNav({ title, path, id }: LeftNavProps) {
    const { t } = useTranslation();
    const { hasAccess } = useAccess();
    const { realm } = useRealm();
    const location = useLocation();
    const encodedRealm = encodeURIComponent(realm);
    const route = routes.find(
        (route) =>
            route.path.replace(/\/:.+?(\?|(?:(?!\/).)*|$)/g, "") === (id || path)
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
            <SidebarMenuButton asChild isActive={isActive}>
                <NavLink
                    to={to}
                    data-testid={"nav-item" + path.replace("/", "-")}
                    end={false}
                >
                    {t(title)}
                </NavLink>
            </SidebarMenuButton>
        </SidebarMenuItem>
    );
}

export function AdminAppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const { t } = useTranslation();
    const { environment, keycloak } = useEnvironment<Environment>();
    const { hasAccess, hasSomeAccess } = useAccess();
    const { componentTypes } = useServerInfo();
    const isFeatureEnabled = useIsFeatureEnabled();
    const pages = componentTypes?.["org.keycloak.services.ui.extend.UiPageProvider"];
    const { realm, realmRepresentation } = useRealm();

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
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <a href={environment.logoUrl || "#"}>
                                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg font-semibold">
                                    {realm?.slice(0, 2).toUpperCase() ?? "KC"}
                                </div>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-medium">
                                        {label(t, realmRepresentation?.displayName, realm)}
                                    </span>
                                    <span className="truncate text-xs text-muted-foreground">
                                        {t("currentRealm")}
                                    </span>
                                </div>
                            </a>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                {showManageRealm && (
                    <SidebarGroup>
                        <SidebarGroupLabel>{t("manageRealms")}</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                <LeftNav title={t("manageRealms")} path="/realms" />
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                )}
                {showManage && (
                    <SidebarGroup>
                        <SidebarGroupLabel>{t("manage")}</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {isFeatureEnabled(Feature.Organizations) &&
                                    realmRepresentation?.organizationsEnabled && (
                                        <LeftNav title="organizations" path="/organizations" />
                                    )}
                                <LeftNav title="clients" path="/clients" />
                                <LeftNav title="clientScopes" path="/client-scopes" />
                                <LeftNav title="realmRoles" path="/roles" />
                                <LeftNav title="users" path="/users" />
                                <LeftNav title="groups" path="/groups" />
                                <LeftNav title="sessions" path="/sessions" />
                                <LeftNav title="events" path="/events" />
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                )}
                {showConfigure && (
                    <SidebarGroup>
                        <SidebarGroupLabel>{t("configure")}</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                <LeftNav title="realmSettings" path="/realm-settings" />
                                <LeftNav title="authentication" path="/authentication" />
                                {isFeatureEnabled(Feature.AdminFineGrainedAuthzV2) &&
                                    realmRepresentation?.adminPermissionsEnabled && (
                                        <LeftNav title="permissions" path="/permissions" />
                                    )}
                                <LeftNav
                                    title="identityProviders"
                                    path="/identity-providers"
                                />
                                <LeftNav title="userFederation" path="/user-federation" />
                                {showWorkflows && (
                                    <LeftNav title="workflows" path="/workflows" />
                                )}
                                {isFeatureEnabled(Feature.DeclarativeUI) &&
                                    pages?.map((p) => (
                                        <LeftNav
                                            key={p.id}
                                            title={p.id}
                                            path={toPage({ providerId: p.id }).pathname!}
                                            id="/page-section"
                                        />
                                    ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                )}
            </SidebarContent>
            <SidebarFooter>
                <AdminNavUser
                    userMenuInfo={{
                        keycloak,
                        userName: loggedInUserName(keycloak.idTokenParsed, t),
                        userEmail: userEmailFromToken(keycloak.idTokenParsed),
                        userAvatarUrl: keycloak.idTokenParsed?.picture ?? undefined,
                        initials: avatarInitials(keycloak.idTokenParsed)
                    }}
                />
            </SidebarFooter>
        </Sidebar>
    );
}
