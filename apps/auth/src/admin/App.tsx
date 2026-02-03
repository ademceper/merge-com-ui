/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/App.tsx"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import { SessionExpirationWarningOverlay } from "../shared/SessionExpirationWarningOverlay";
import KeycloakAdminClient from "@keycloak/keycloak-admin-client";
import { mainPageContentId, useEnvironment } from "../shared/keycloak-ui-shared";
import { SidebarInset, SidebarProvider } from "@merge/ui/components/sidebar";
import { PropsWithChildren, Suspense, useEffect, useState } from "react";
import { Outlet } from "react-router-dom";

import {
    ErrorBoundaryFallback,
    ErrorBoundaryProvider,
    KeycloakSpinner
} from "../shared/keycloak-ui-shared";
import { AdminClientContext, initAdminClient } from "./admin-client";
import { AdminAppSidebar } from "./components/AdminAppSidebar";
import { PageBreadCrumbs } from "./components/bread-crumb/PageBreadCrumbs";
import { ErrorRenderer } from "./components/error/ErrorRenderer";
import { RecentRealmsProvider } from "./context/RecentRealms";
import { AccessContextProvider } from "./context/access/Access";
import { RealmContextProvider } from "./context/realm-context/RealmContext";
import { ServerInfoProvider } from "./context/server-info/ServerInfoProvider";
import { WhoAmIContextProvider } from "./context/whoami/WhoAmI";
import type { Environment } from "./environment";
import { SubGroups } from "./groups/SubGroupsContext";
import { AuthWall } from "./root/AuthWall";
import { Banners } from "./Banners";
import { AdminHeader } from "./components/AdminHeader";

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

    if (!adminClient) return <KeycloakSpinner />;
    return (
        <AdminClientContext.Provider value={{ keycloak, adminClient }}>
            <AppContexts>
                <Banners />
                <SidebarProvider defaultOpen={true} className="min-h-svh">
                    <AdminAppSidebar />
                    <SidebarInset>
                        <AdminHeader />
                        <div
                            id={mainPageContentId}
                            className="flex flex-1 flex-col gap-4 px-4 py-4 pt-0"
                        >
                            <ErrorBoundaryFallback fallback={ErrorRenderer}>
                                <Suspense fallback={<KeycloakSpinner />}>
                                    <AuthWall>
                                        <Outlet />
                                    </AuthWall>
                                </Suspense>
                            </ErrorBoundaryFallback>
                        </div>
                    </SidebarInset>
                </SidebarProvider>
                <SessionExpirationWarningOverlay warnUserSecondsBeforeAutoLogout={45} />
            </AppContexts>
        </AdminClientContext.Provider>
    );
};
