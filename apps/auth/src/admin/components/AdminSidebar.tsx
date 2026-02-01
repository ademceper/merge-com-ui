import { useTranslation } from "react-i18next";
import { NavLink } from "react-router-dom";
import { buttonVariants } from "@merge/ui/components/button";
import { Separator } from "@merge/ui/components/separator";
import { Badge } from "@merge/ui/components/badge";
import { cn } from "@/lib/utils";
import { label, useEnvironment } from "../../shared/keycloak-ui-shared";
import { useAccess } from "../context/access/Access";
import { useRealm } from "../context/realm-context/RealmContext";
import { useServerInfo } from "../context/server-info/ServerInfoProvider";
import type { Environment } from "../environment";
import { toPage } from "../page/routes";
import { routes } from "../routes";
import useIsFeatureEnabled, { Feature } from "../utils/useIsFeatureEnabled";

type LeftNavProps = {
    title: string;
    path: string;
    id?: string;
};

function LeftNav({ title, path, id }: LeftNavProps) {
    const { t } = useTranslation();
    const { hasAccess } = useAccess();
    const { realm } = useRealm();
    const encodedRealm = encodeURIComponent(realm);
    const route = routes.find(
        (r: { path: string }) =>
            r.path.replace(/\/:.+?(\?|(?:(?!\/).)*|$)/g, "") === (id || path)
    );

    const accessAllowed =
        route &&
        (route.handle.access instanceof Array
            ? hasAccess(...route.handle.access)
            : hasAccess(route.handle.access));

    if (!accessAllowed) return null;

    const to = `/${encodedRealm}${path}`;
    return (
        <NavLink
            to={to}
            end={path !== "/"}
            className={({ isActive }) =>
                cn(
                    buttonVariants({ variant: "ghost" }),
                    "justify-start w-full",
                    isActive ? "bg-muted hover:bg-muted" : "hover:bg-transparent hover:underline"
                )
            }
        >
            {t(title)}
        </NavLink>
    );
}

export function AdminSidebar() {
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

    const showWorkflows = hasAccess("manage-realm") && isFeatureEnabled(Feature.Workflows);
    const showManageRealm = environment.masterRealm === environment.realm;

    return (
        <aside className="w-full lg:w-64 shrink-0 space-y-4">
            <div className="space-y-1">
                <h3 className="text-sm font-medium text-muted-foreground px-2">
                    {label(t, realmRepresentation?.displayName, realm)}
                </h3>
                <Badge variant="secondary" className="ml-2">
                    {t("currentRealm")}
                </Badge>
            </div>
            <Separator />

            {showManageRealm && (
                <nav className="flex flex-col gap-1">
                    <p className="text-xs font-semibold text-muted-foreground px-2 mb-1">
                        {t("manageRealms")}
                    </p>
                    <LeftNav title={t("manageRealms")} path="/realms" />
                </nav>
            )}

            {showManage && (
                <>
                    <nav className="flex flex-col gap-1">
                        <p className="text-xs font-semibold text-muted-foreground px-2 mb-1">
                            {t("manage")}
                        </p>
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
                    </nav>
                    <Separator />
                </>
            )}

            {showConfigure && (
                <nav className="flex flex-col gap-1">
                    <p className="text-xs font-semibold text-muted-foreground px-2 mb-1">
                        {t("configure")}
                    </p>
                    <LeftNav title="realmSettings" path="/realm-settings" />
                    <LeftNav title="authentication" path="/authentication" />
                    {isFeatureEnabled(Feature.AdminFineGrainedAuthzV2) &&
                        realmRepresentation?.adminPermissionsEnabled && (
                            <LeftNav title="permissions" path="/permissions" />
                        )}
                    <LeftNav title="identityProviders" path="/identity-providers" />
                    <LeftNav title="userFederation" path="/user-federation" />
                    {showWorkflows && <LeftNav title="workflows" path="/workflows" />}
                    {isFeatureEnabled(Feature.DeclarativeUI) &&
                        pages?.map((p: { id: string }) => (
                            <LeftNav
                                key={p.id}
                                title={p.id}
                                path={toPage({ providerId: p.id }).pathname!}
                                id="/page-section"
                            />
                        ))}
                </nav>
            )}
        </aside>
    );
}
