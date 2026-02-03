/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/PageNav.tsx"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import { label, useEnvironment } from "../shared/keycloak-ui-shared";
import { Label } from "@merge/ui/components/label";
import { useTranslation } from "react-i18next";
import { NavLink } from "react-router-dom";
import { useAccess } from "./context/access/Access";
import { useRealm } from "./context/realm-context/RealmContext";
import { useServerInfo } from "./context/server-info/ServerInfoProvider";
import { Environment } from "./environment";
import { toPage } from "./page/routes";
import { routes } from "./routes";
import useIsFeatureEnabled, { Feature } from "./utils/useIsFeatureEnabled";

type LeftNavProps = {
    title: string;
    path: string;
    id?: string;
};

const LeftNav = ({ title, path, id }: LeftNavProps) => {
    const { t } = useTranslation();
    const { hasAccess } = useAccess();
    const { realm } = useRealm();
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
        return undefined;
    }

    const name = "nav-item" + path.replace("/", "-");
    return (
        <li>
            <NavLink
                id={name}
                data-testid={name}
                to={`/${encodedRealm}${path}`}
                className={({ isActive }) =>
                    `block rounded-md px-2 py-1.5 text-sm no-underline outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring${isActive ? " bg-muted font-medium" : ""}`
                }
            >
                {t(title)}
            </NavLink>
        </li>
    );
};

export const PageNav = () => {
    const { t } = useTranslation();
    const { environment } = useEnvironment<Environment>();
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
        <aside className="keycloak__page_nav__nav border-r bg-muted/30 flex w-56 flex-col">
            <div className="flex flex-1 flex-col gap-1 overflow-y-auto p-2">
                <nav className="flex flex-col gap-1" aria-label={t("navigation")}>
                    <h2
                        className="text-muted-foreground px-2 text-xs font-medium"
                        style={{ wordWrap: "break-word" }}
                    >
                        <span data-testid="currentRealm">
                            {label(t, realmRepresentation?.displayName, realm)}
                        </span>{" "}
                        <Label className="text-primary">{t("currentRealm")}</Label>
                    </h2>
                    {showManageRealm && (
                        <ul className="flex flex-col gap-0.5">
                            <LeftNav title={t("manageRealms")} path="/realms" />
                        </ul>
                    )}
                    {showManage && (
                        <ul className="flex flex-col gap-0.5" aria-label={t("manage")}>
                            <li className="px-2 py-1 text-xs font-medium text-muted-foreground">{t("manage")}</li>
                            {isFeatureEnabled(Feature.Organizations) &&
                                realmRepresentation?.organizationsEnabled && (
                                    <LeftNav
                                        title="organizations"
                                        path="/organizations"
                                    />
                                )}
                            <LeftNav title="clients" path="/clients" />
                            <LeftNav title="clientScopes" path="/client-scopes" />
                            <LeftNav title="realmRoles" path="/roles" />
                            <LeftNav title="users" path="/users" />
                            <LeftNav title="groups" path="/groups" />
                            <LeftNav title="sessions" path="/sessions" />
                            <LeftNav title="events" path="/events" />
                        </ul>
                    )}

                    {showConfigure && (
                        <ul className="flex flex-col gap-0.5" aria-label={t("configure")}>
                            <li className="px-2 py-1 text-xs font-medium text-muted-foreground">{t("configure")}</li>
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
                                pages?.map(p => (
                                    <LeftNav
                                        key={p.id}
                                        title={p.id}
                                        path={toPage({ providerId: p.id }).pathname!}
                                        id="/page-section"
                                    />
                                ))}
                        </ul>
                    )}
                </nav>
            </div>
        </aside>
    );
};
