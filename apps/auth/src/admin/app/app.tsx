import type KeycloakAdminClient from "@keycloak/keycloak-admin-client";
import {
    SidebarInset,
    SidebarPage,
    SidebarProvider
} from "@merge-rd/ui/components/sidebar";
import { QueryClientProvider } from "@tanstack/react-query";
import { Outlet, useMatches } from "@tanstack/react-router";
import React, { Suspense, useEffect, useMemo, useState } from "react";
import {
    ErrorBoundaryFallback,
    ErrorBoundaryProvider,
    KeycloakSpinner,
    mainPageContentId,
    useEnvironment
} from "@/shared/keycloak-ui-shared";
import { SessionExpirationWarningOverlay } from "@/shared/session-expiration-warning-overlay";
import { ErrorRenderer } from "../shared/ui/error/error-renderer";
import { AdminAppSidebar } from "../widgets/admin-app-sidebar";
import { AdminHeader } from "../widgets/admin-header";
import { Banners } from "../widgets/banners";
import { AdminClientContext, initAdminClient } from "./admin-client";
import type { Environment } from "./environment";
import { AccessContextProvider } from "./providers/access/access";
import { BootstrapPrefetch } from "./providers/bootstrap-prefetch";
import { composeProviders } from "./providers/compose-providers";
import { RealmContextProvider } from "./providers/realm-context/realm-context";
import { RecentRealmsProvider } from "./providers/recent-realms";
import { ServerInfoProvider } from "./providers/server-info/server-info-provider";
import { SubGroups } from "./providers/sub-groups/sub-groups-context";
import { WhoAmIContextProvider } from "./providers/whoami/who-am-i";
import { AuthWall } from "./root/auth-wall";

import { queryClient } from "./query-client";

/**
 * Provider hierarchy with parallel fetching:
 * ErrorBoundary → RealmContext (blocking) → BootstrapPrefetch (fetches ServerInfo + WhoAmI in parallel)
 *   → ServerInfo (reads from cache) → WhoAmI (reads from cache) → rest
 */
const AppContexts = composeProviders(
    ErrorBoundaryProvider,
    ({ children }: { children: React.ReactNode }) => (
        <ErrorBoundaryFallback fallback={ErrorRenderer}>{children}</ErrorBoundaryFallback>
    ),
    RealmContextProvider,
    BootstrapPrefetch,
    ServerInfoProvider,
    WhoAmIContextProvider,
    RecentRealmsProvider,
    AccessContextProvider,
    SubGroups
);

export const App = () => {
    const { keycloak, environment } = useEnvironment<Environment>();
    const [adminClient, setAdminClient] = useState<KeycloakAdminClient>();

    useEffect(() => {
        const fragment = "#/";
        if (window.location.href.endsWith(fragment)) {
            const newPath = window.location.pathname.replace(fragment, "");
            window.history.replaceState(null, "", newPath);
        }
        const init = async () => {
            const client = await initAdminClient(keycloak, environment);
            setAdminClient(client);
        };
        init().catch(console.error);
    }, [environment, keycloak]);

    const matches = useMatches();
    const isNotFound = useMemo(
        () =>
            matches.some(m => {
                const match = m as unknown as {
                    routeContext?: { isNotFound?: boolean };
                    handle?: { isNotFound?: boolean };
                };
                return (
                    match.routeContext?.isNotFound === true ||
                    match.handle?.isNotFound === true
                );
            }),
        [matches]
    );

    if (!adminClient) return <KeycloakSpinner />;

    const adminContext = { keycloak, adminClient };

    return (
        <QueryClientProvider client={queryClient}>
            <AdminClientContext.Provider value={adminContext}>
                <AppContexts>
                    <Banners />
                    {isNotFound ? (
                        <div className="min-h-svh flex flex-1 flex-col">
                            <Outlet />
                        </div>
                    ) : (
                        <SidebarProvider
                            defaultOpen={true}
                            className="h-svh bg-sidebar overflow-hidden"
                            data-scale-wrapper
                        >
                            <AdminAppSidebar />
                            <SidebarInset>
                                <AdminHeader />
                                <SidebarPage id={mainPageContentId}>
                                    <ErrorBoundaryFallback fallback={ErrorRenderer}>
                                        <Suspense fallback={<KeycloakSpinner />}>
                                            <AuthWall>
                                                <Outlet />
                                            </AuthWall>
                                        </Suspense>
                                    </ErrorBoundaryFallback>
                                </SidebarPage>
                            </SidebarInset>
                        </SidebarProvider>
                    )}
                    <SessionExpirationWarningOverlay
                        warnUserSecondsBeforeAutoLogout={45}
                    />
                </AppContexts>
            </AdminClientContext.Provider>
        </QueryClientProvider>
    );
};
