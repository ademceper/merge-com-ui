import { SessionExpirationWarningOverlay } from "../shared/session-expiration-warning-overlay";
import KeycloakAdminClient from "@keycloak/keycloak-admin-client";
import { mainPageContentId, useEnvironment } from "../shared/keycloak-ui-shared";
import { SidebarInset, SidebarPage, SidebarProvider } from "@merge-rd/ui/components/sidebar";
import type { ComponentType } from "react";
import { PropsWithChildren, Suspense, useEffect, useState } from "react";
import { Outlet, useMatches } from "react-router-dom";

import {
    ErrorBoundaryFallback,
    ErrorBoundaryProvider,
    KeycloakSpinner
} from "../shared/keycloak-ui-shared";
import { AdminClientContext, initAdminClient } from "./admin-client";
import { AdminAppSidebar } from "./components/admin-app-sidebar";
import { ErrorRenderer } from "./components/error/error-renderer";
import { RecentRealmsProvider } from "./context/recent-realms";
import { AccessContextProvider } from "./context/access/access";
import { RealmContextProvider } from "./context/realm-context/realm-context";
import { ServerInfoProvider } from "./context/server-info/server-info-provider";
import { WhoAmIContextProvider } from "./context/whoami/who-am-i";
import type { Environment } from "./environment";
import { SubGroups } from "./groups/sub-groups-context";
import { AuthWall } from "./root/auth-wall";
import { Banners } from "./banners";
import { AdminHeader } from "./components/admin-header";

const OutletComponent = Outlet as ComponentType;

export const AppContexts = ({ children }: PropsWithChildren) => (
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
        (m) => (m.handle as { isNotFound?: true } | undefined)?.isNotFound === true
    );

    if (!adminClient) return <KeycloakSpinner />;

    if (isNotFound) {
        return (
            <AdminClientContext.Provider value={{ keycloak, adminClient }}>
                <AppContexts>
                    <Banners />
                    <div className="min-h-svh flex flex-1 flex-col">
                        <OutletComponent />
                    </div>
                    <SessionExpirationWarningOverlay warnUserSecondsBeforeAutoLogout={45} />
                </AppContexts>
            </AdminClientContext.Provider>
        );
    }

    return (
        <AdminClientContext.Provider value={{ keycloak, adminClient }}>
            <AppContexts>
                <Banners />
                <SidebarProvider defaultOpen={true} className="h-svh bg-sidebar overflow-hidden" data-scale-wrapper>
                    <AdminAppSidebar />
                    <SidebarInset>
                        <AdminHeader />
                        <SidebarPage
                            id={mainPageContentId}
                        >
                            <ErrorBoundaryFallback fallback={ErrorRenderer}>
                                <Suspense fallback={<KeycloakSpinner />}>
                                    <AuthWall>
                                        <OutletComponent />
                                    </AuthWall>
                                </Suspense>
                            </ErrorBoundaryFallback>
                        </SidebarPage>
                    </SidebarInset>
                </SidebarProvider>
                <SessionExpirationWarningOverlay warnUserSecondsBeforeAutoLogout={45} />
            </AppContexts>
        </AdminClientContext.Provider>
    );
};
