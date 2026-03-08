import type KeycloakAdminClient from "@keycloak/keycloak-admin-client";
import {
    SidebarInset,
    SidebarPage,
    SidebarProvider
} from "@merge-rd/ui/components/sidebar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Outlet, useMatches } from "@tanstack/react-router";
import { type PropsWithChildren, Suspense, useEffect, useState } from "react";
import {
    ErrorBoundaryFallback,
    ErrorBoundaryProvider,
    KeycloakSpinner,
    mainPageContentId,
    useEnvironment
} from "../../shared/keycloak-ui-shared";
import { SessionExpirationWarningOverlay } from "../../shared/session-expiration-warning-overlay";
import { SubGroups } from "../pages/groups/sub-groups-context";
import { ErrorRenderer } from "../shared/ui/error/error-renderer";
import { AdminAppSidebar } from "../widgets/admin-app-sidebar";
import { AdminHeader } from "../widgets/admin-header";
import { Banners } from "../widgets/banners";
import { AdminClientContext, initAdminClient } from "./admin-client";
import type { Environment } from "./environment";
import { AccessContextProvider } from "./providers/access/access";
import { RealmContextProvider } from "./providers/realm-context/realm-context";
import { RecentRealmsProvider } from "./providers/recent-realms";
import { ServerInfoProvider } from "./providers/server-info/server-info-provider";
import { WhoAmIContextProvider } from "./providers/whoami/who-am-i";
import { AuthWall } from "./root/auth-wall";

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            retry: false,
            staleTime: 30_000
        }
    }
});

const AppContexts = ({ children }: PropsWithChildren) => (
    <ErrorBoundaryProvider>
        <ErrorBoundaryFallback fallback={ErrorRenderer}>
            <ServerInfoProvider>
                <RealmContextProvider>
                    <WhoAmIContextProvider>
                        <RecentRealmsProvider>
                            <AccessContextProvider>
                                <SubGroups>{children}</SubGroups>
                            </AccessContextProvider>
                        </RecentRealmsProvider>
                    </WhoAmIContextProvider>
                </RealmContextProvider>
            </ServerInfoProvider>
        </ErrorBoundaryFallback>
    </ErrorBoundaryProvider>
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
    const isNotFound = matches.some(
        (m: any) =>
            m.routeContext?.isNotFound === true || (m as any).handle?.isNotFound === true
    );

    if (!adminClient) return <KeycloakSpinner />;

    if (isNotFound) {
        return (
            <QueryClientProvider client={queryClient}>
                <AdminClientContext.Provider value={{ keycloak, adminClient }}>
                    <AppContexts>
                        <Banners />
                        <div className="min-h-svh flex flex-1 flex-col">
                            <Outlet />
                        </div>
                        <SessionExpirationWarningOverlay
                            warnUserSecondsBeforeAutoLogout={45}
                        />
                    </AppContexts>
                </AdminClientContext.Provider>
            </QueryClientProvider>
        );
    }

    return (
        <QueryClientProvider client={queryClient}>
            <AdminClientContext.Provider value={{ keycloak, adminClient }}>
                <AppContexts>
                    <Banners />
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
                    <SessionExpirationWarningOverlay
                        warnUserSecondsBeforeAutoLogout={45}
                    />
                </AppContexts>
            </AdminClientContext.Provider>
        </QueryClientProvider>
    );
};
