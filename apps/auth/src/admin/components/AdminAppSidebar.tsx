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
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubItem,
    SidebarMenuSubButton
} from "@merge/ui/components/sidebar";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger
} from "@merge/ui/components/collapsible";
import { useTranslation } from "react-i18next";
import { NavLink, useLocation } from "react-router-dom";
import { useAccess } from "../context/access/Access";
import { useRealm } from "../context/realm-context/RealmContext";
import { useServerInfo } from "../context/server-info/ServerInfoProvider";
import type { Environment } from "../environment";
import type { UserMenuInfo } from "./AdminHeader";
import { toPage } from "../page/routes";
import { routes } from "../routes";
import useIsFeatureEnabled, { Feature } from "../utils/useIsFeatureEnabled";
import { AdminNavUser } from "./AdminNavUser";
import { CaretRightIcon } from "@phosphor-icons/react";

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

type SubNavLinkProps = { to: string; title: string; dataTestId?: string };
function SubNavLink({ to, title, dataTestId }: SubNavLinkProps) {
    const { t } = useTranslation();
    const location = useLocation();
    const isActive = location.pathname === to || location.pathname.startsWith(to + "/");
    return (
        <SidebarMenuSubItem>
            <SidebarMenuSubButton asChild isActive={isActive}>
                <NavLink to={to} data-testid={dataTestId} end={to === location.pathname}>
                    <span>{t(title)}</span>
                </NavLink>
            </SidebarMenuSubButton>
        </SidebarMenuSubItem>
    );
}

export function AdminAppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const { t } = useTranslation();
    const location = useLocation();
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
                                <Collapsible
                                    asChild
                                    defaultOpen={location.pathname.includes("/clients")}
                                    className="group/collapsible"
                                >
                                    <SidebarMenuItem>
                                        <CollapsibleTrigger asChild>
                                            <SidebarMenuButton
                                                tooltip={t("clients")}
                                                isActive={location.pathname.includes("/clients")}
                                            >
                                                <span>{t("clients")}</span>
                                                <CaretRightIcon className="ml-auto size-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                                            </SidebarMenuButton>
                                        </CollapsibleTrigger>
                                        <CollapsibleContent>
                                            <SidebarMenuSub>
                                                <SubNavLink
                                                    to={`/${encodeURIComponent(realm)}/clients/list`}
                                                    title="clientsList"
                                                    dataTestId="clients-list-tab"
                                                />
                                                <SubNavLink
                                                    to={`/${encodeURIComponent(realm)}/clients/initial-access-token`}
                                                    title="initialAccessToken"
                                                    dataTestId="initial-access-token-tab"
                                                />
                                                <Collapsible
                                                    asChild
                                                    defaultOpen={location.pathname.includes("/client-registration")}
                                                    className="group/collapsible-nested"
                                                >
                                                    <SidebarMenuSubItem>
                                                        <CollapsibleTrigger asChild>
                                                            <SidebarMenuSubButton
                                                                isActive={location.pathname.includes("/client-registration")}
                                                            >
                                                                <span>{t("clientRegistration")}</span>
                                                                <CaretRightIcon className="ml-auto size-3 transition-transform duration-200 group-data-[state=open]/collapsible-nested:rotate-90" />
                                                            </SidebarMenuSubButton>
                                                        </CollapsibleTrigger>
                                                        <CollapsibleContent>
                                                            <SidebarMenuSub className="ml-2">
                                                                <SubNavLink
                                                                    to={`/${encodeURIComponent(realm)}/clients/client-registration/anonymous`}
                                                                    title="anonymousAccessPolicies"
                                                                    dataTestId="client-registration-anonymous-tab"
                                                                />
                                                                <SubNavLink
                                                                    to={`/${encodeURIComponent(realm)}/clients/client-registration/authenticated`}
                                                                    title="authenticatedAccessPolicies"
                                                                    dataTestId="client-registration-authenticated-tab"
                                                                />
                                                            </SidebarMenuSub>
                                                        </CollapsibleContent>
                                                    </SidebarMenuSubItem>
                                                </Collapsible>
                                            </SidebarMenuSub>
                                        </CollapsibleContent>
                                    </SidebarMenuItem>
                                </Collapsible>
                                <LeftNav title="clientScopes" path="/client-scopes" />
                                <LeftNav title="realmRoles" path="/roles" />
                                {hasAccess("query-users") && (
                                    <Collapsible
                                        asChild
                                        defaultOpen={location.pathname.includes("/users")}
                                        className="group/collapsible"
                                    >
                                        <SidebarMenuItem>
                                            <CollapsibleTrigger asChild>
                                                <SidebarMenuButton
                                                    tooltip={t("users")}
                                                    isActive={location.pathname.includes("/users")}
                                                >
                                                    <span>{t("users")}</span>
                                                    <CaretRightIcon className="ml-auto size-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                                                </SidebarMenuButton>
                                            </CollapsibleTrigger>
                                            <CollapsibleContent>
                                                <SidebarMenuSub>
                                                    <SubNavLink
                                                        to={`/${encodeURIComponent(realm)}/users/list`}
                                                        title="userList"
                                                        dataTestId="listTab"
                                                    />
                                                    {isFeatureEnabled(Feature.AdminFineGrainedAuthz) &&
                                                        hasAccess("manage-authorization", "manage-users", "manage-clients") && (
                                                        <SubNavLink
                                                            to={`/${encodeURIComponent(realm)}/users/permissions`}
                                                            title="permissions"
                                                            dataTestId="permissionsTab"
                                                        />
                                                    )}
                                                </SidebarMenuSub>
                                            </CollapsibleContent>
                                        </SidebarMenuItem>
                                    </Collapsible>
                                )}
                                <LeftNav title="groups" path="/groups" />
                                <LeftNav title="sessions" path="/sessions" />
                                {hasAccess("view-events") && (
                                    <Collapsible
                                        asChild
                                        defaultOpen={location.pathname.includes("/events")}
                                        className="group/collapsible"
                                    >
                                        <SidebarMenuItem>
                                            <CollapsibleTrigger asChild>
                                                <SidebarMenuButton
                                                    tooltip={t("titleEvents")}
                                                    isActive={location.pathname.includes("/events")}
                                                >
                                                    <span>{t("titleEvents")}</span>
                                                    <CaretRightIcon className="ml-auto size-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                                                </SidebarMenuButton>
                                            </CollapsibleTrigger>
                                            <CollapsibleContent>
                                                <SidebarMenuSub>
                                                    <SubNavLink
                                                        to={`/${encodeURIComponent(realm)}/events/user-events`}
                                                        title="userEvents"
                                                    />
                                                    <SubNavLink
                                                        to={`/${encodeURIComponent(realm)}/events/admin-events`}
                                                        title="adminEvents"
                                                        dataTestId="admin-events-tab"
                                                    />
                                                </SidebarMenuSub>
                                            </CollapsibleContent>
                                        </SidebarMenuItem>
                                    </Collapsible>
                                )}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                )}
                {showConfigure && (
                    <SidebarGroup>
                        <SidebarGroupLabel>{t("configure")}</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {hasAccess("view-realm") && (
                                    <Collapsible
                                        asChild
                                        defaultOpen={location.pathname.includes("/realm-settings")}
                                        className="group/collapsible"
                                    >
                                        <SidebarMenuItem>
                                            <CollapsibleTrigger asChild>
                                                <SidebarMenuButton
                                                    tooltip={t("realmSettings")}
                                                    isActive={location.pathname.includes("/realm-settings")}
                                                >
                                                    <span>{t("realmSettings")}</span>
                                                    <CaretRightIcon className="ml-auto size-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                                                </SidebarMenuButton>
                                            </CollapsibleTrigger>
                                            <CollapsibleContent>
                                                <SidebarMenuSub>
                                                    <SubNavLink to={`/${encodeURIComponent(realm)}/realm-settings/general`} title="general" dataTestId="rs-general-tab" />
                                                    <SubNavLink to={`/${encodeURIComponent(realm)}/realm-settings/login`} title="login" dataTestId="rs-login-tab" />
                                                    <SubNavLink to={`/${encodeURIComponent(realm)}/realm-settings/email`} title="email" dataTestId="rs-email-tab" />
                                                    <Collapsible
                                                        asChild
                                                        defaultOpen={location.pathname.includes("/realm-settings/themes")}
                                                        className="group/collapsible-themes"
                                                    >
                                                        <SidebarMenuSubItem>
                                                            <CollapsibleTrigger asChild>
                                                                <SidebarMenuSubButton
                                                                    isActive={location.pathname.includes("/realm-settings/themes")}
                                                                >
                                                                    <span>{t("themes")}</span>
                                                                    <CaretRightIcon className="ml-auto size-3 transition-transform duration-200 group-data-[state=open]/collapsible-themes:rotate-90" />
                                                                </SidebarMenuSubButton>
                                                            </CollapsibleTrigger>
                                                            <CollapsibleContent>
                                                                <SidebarMenuSub className="ml-2">
                                                                    <SubNavLink
                                                                        to={`/${encodeURIComponent(realm)}/realm-settings/themes/settings`}
                                                                        title="themes"
                                                                        dataTestId="rs-themes-settings-tab"
                                                                    />
                                                                    <SubNavLink
                                                                        to={`/${encodeURIComponent(realm)}/realm-settings/themes/lightColors`}
                                                                        title="themeColorsLight"
                                                                        dataTestId="rs-themes-light-tab"
                                                                    />
                                                                    <SubNavLink
                                                                        to={`/${encodeURIComponent(realm)}/realm-settings/themes/darkColors`}
                                                                        title="themeColorsDark"
                                                                        dataTestId="rs-themes-dark-tab"
                                                                    />
                                                                </SidebarMenuSub>
                                                            </CollapsibleContent>
                                                        </SidebarMenuSubItem>
                                                    </Collapsible>
                                                    <Collapsible
                                                        asChild
                                                        defaultOpen={location.pathname.includes("/realm-settings/keys")}
                                                        className="group/collapsible-keys"
                                                    >
                                                        <SidebarMenuSubItem>
                                                            <CollapsibleTrigger asChild>
                                                                <SidebarMenuSubButton
                                                                    isActive={location.pathname.includes("/realm-settings/keys")}
                                                                >
                                                                    <span>{t("keys")}</span>
                                                                    <CaretRightIcon className="ml-auto size-3 transition-transform duration-200 group-data-[state=open]/collapsible-keys:rotate-90" />
                                                                </SidebarMenuSubButton>
                                                            </CollapsibleTrigger>
                                                            <CollapsibleContent>
                                                                <SidebarMenuSub className="ml-2">
                                                                    <SubNavLink
                                                                        to={`/${encodeURIComponent(realm)}/realm-settings/keys/list`}
                                                                        title="keysList"
                                                                        dataTestId="rs-keys-list-tab"
                                                                    />
                                                                    <SubNavLink
                                                                        to={`/${encodeURIComponent(realm)}/realm-settings/keys/providers`}
                                                                        title="providers"
                                                                        dataTestId="rs-keys-providers-tab"
                                                                    />
                                                                </SidebarMenuSub>
                                                            </CollapsibleContent>
                                                        </SidebarMenuSubItem>
                                                    </Collapsible>
                                                    <SubNavLink to={`/${encodeURIComponent(realm)}/realm-settings/events`} title="events" dataTestId="rs-realm-events-tab" />
                                                    <SubNavLink to={`/${encodeURIComponent(realm)}/realm-settings/localization`} title="localization" dataTestId="rs-localization-tab" />
                                                    <SubNavLink to={`/${encodeURIComponent(realm)}/realm-settings/security-defenses`} title="securityDefences" dataTestId="rs-security-defenses-tab" />
                                                    <SubNavLink to={`/${encodeURIComponent(realm)}/realm-settings/sessions`} title="sessions" dataTestId="rs-sessions-tab" />
                                                    <SubNavLink to={`/${encodeURIComponent(realm)}/realm-settings/tokens`} title="tokens" dataTestId="rs-tokens-tab" />
                                                    {isFeatureEnabled(Feature.ClientPolicies) && (
                                                        <Collapsible
                                                            asChild
                                                            defaultOpen={location.pathname.includes("/realm-settings/client-policies")}
                                                            className="group/collapsible-client-policies"
                                                        >
                                                            <SidebarMenuSubItem>
                                                                <CollapsibleTrigger asChild>
                                                                    <SidebarMenuSubButton
                                                                        isActive={location.pathname.includes("/realm-settings/client-policies")}
                                                                    >
                                                                        <span>{t("clientPolicies")}</span>
                                                                        <CaretRightIcon className="ml-auto size-3 transition-transform duration-200 group-data-[state=open]/collapsible-client-policies:rotate-90" />
                                                                    </SidebarMenuSubButton>
                                                                </CollapsibleTrigger>
                                                                <CollapsibleContent>
                                                                    <SidebarMenuSub className="ml-2">
                                                                        <SubNavLink
                                                                            to={`/${encodeURIComponent(realm)}/realm-settings/client-policies/profiles`}
                                                                            title="profiles"
                                                                            dataTestId="rs-client-policies-profiles-tab"
                                                                        />
                                                                        <SubNavLink
                                                                            to={`/${encodeURIComponent(realm)}/realm-settings/client-policies/policies`}
                                                                            title="policies"
                                                                            dataTestId="rs-client-policies-policies-tab"
                                                                        />
                                                                    </SidebarMenuSub>
                                                                </CollapsibleContent>
                                                            </SidebarMenuSubItem>
                                                        </Collapsible>
                                                    )}
                                                    <Collapsible
                                                        asChild
                                                        defaultOpen={location.pathname.includes("/realm-settings/user-profile")}
                                                        className="group/collapsible-user-profile"
                                                    >
                                                        <SidebarMenuSubItem>
                                                            <CollapsibleTrigger asChild>
                                                                <SidebarMenuSubButton
                                                                    isActive={location.pathname.includes("/realm-settings/user-profile")}
                                                                >
                                                                    <span>{t("userProfile")}</span>
                                                                    <CaretRightIcon className="ml-auto size-3 transition-transform duration-200 group-data-[state=open]/collapsible-user-profile:rotate-90" />
                                                                </SidebarMenuSubButton>
                                                            </CollapsibleTrigger>
                                                            <CollapsibleContent>
                                                                <SidebarMenuSub className="ml-2">
                                                                    <SubNavLink
                                                                        to={`/${encodeURIComponent(realm)}/realm-settings/user-profile/attributes`}
                                                                        title="attributes"
                                                                        dataTestId="rs-user-profile-attributes-tab"
                                                                    />
                                                                    <SubNavLink
                                                                        to={`/${encodeURIComponent(realm)}/realm-settings/user-profile/attributes-group`}
                                                                        title="attributesGroup"
                                                                        dataTestId="rs-user-profile-attributes-group-tab"
                                                                    />
                                                                    <SubNavLink
                                                                        to={`/${encodeURIComponent(realm)}/realm-settings/user-profile/json-editor`}
                                                                        title="jsonEditor"
                                                                        dataTestId="rs-user-profile-json-editor-tab"
                                                                    />
                                                                </SidebarMenuSub>
                                                            </CollapsibleContent>
                                                        </SidebarMenuSubItem>
                                                    </Collapsible>
                                                    <SubNavLink to={`/${encodeURIComponent(realm)}/realm-settings/user-registration`} title="userRegistration" dataTestId="rs-userRegistration-tab" />
                                                </SidebarMenuSub>
                                            </CollapsibleContent>
                                        </SidebarMenuItem>
                                    </Collapsible>
                                )}
                                <Collapsible
                                    asChild
                                    defaultOpen={location.pathname.includes("/authentication")}
                                    className="group/collapsible"
                                >
                                    <SidebarMenuItem>
                                        <CollapsibleTrigger asChild>
                                            <SidebarMenuButton
                                                tooltip={t("authentication")}
                                                isActive={location.pathname.includes("/authentication")}
                                            >
                                                <span>{t("authentication")}</span>
                                                <CaretRightIcon className="ml-auto size-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                                            </SidebarMenuButton>
                                        </CollapsibleTrigger>
                                        <CollapsibleContent>
                                            <SidebarMenuSub>
                                                <SubNavLink
                                                    to={`/${encodeURIComponent(realm)}/authentication/flows`}
                                                    title="flows"
                                                    dataTestId="authentication-flows-tab"
                                                />
                                                <SubNavLink
                                                    to={`/${encodeURIComponent(realm)}/authentication/required-actions`}
                                                    title="requiredActions"
                                                    dataTestId="authentication-required-actions-tab"
                                                />
                                                <SubNavLink
                                                    to={`/${encodeURIComponent(realm)}/authentication/policies`}
                                                    title="policies"
                                                    dataTestId="authentication-policies-tab"
                                                />
                                            </SidebarMenuSub>
                                        </CollapsibleContent>
                                    </SidebarMenuItem>
                                </Collapsible>
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
