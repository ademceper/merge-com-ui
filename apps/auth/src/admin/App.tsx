/**
 * This file has been claimed for ownership from @keycloakify/keycloak-admin-ui version 260502.0.0.
 * To relinquish ownership and restore this file to its original content, run the following command:
 *
 * $ npx keycloakify own --path "admin/App.tsx" --revert
 */

/* eslint-disable */

// @ts-nocheck

import { SessionExpirationWarningOverlay } from "../shared/SessionExpirationWarningOverlay";
import KeycloakAdminClient from "@keycloak/keycloak-admin-client";
import { useEnvironment } from "../shared/keycloak-ui-shared";
import { PropsWithChildren, useEffect, useState } from "react";

import {
    ErrorBoundaryFallback,
    ErrorBoundaryProvider,
    KeycloakSpinner
} from "../shared/keycloak-ui-shared";
import { AdminClientContext, initAdminClient } from "./admin-client";
import { ErrorRenderer } from "./components/error/ErrorRenderer";
import { AdminLayout } from "./components/AdminLayout";
import { RecentRealmsProvider } from "./context/RecentRealms";
import { AccessContextProvider } from "./context/access/Access";
import { RealmContextProvider } from "./context/realm-context/RealmContext";
import { ServerInfoProvider } from "./context/server-info/ServerInfoProvider";
import { WhoAmIContextProvider } from "./context/whoami/WhoAmI";
import type { Environment } from "./environment";
import { SubGroups } from "./groups/SubGroupsContext";
import { Banners } from "./Banners";

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
                <div className="flex flex-col min-h-screen">
                    <Banners />
                    <AdminLayout />
                </div>
                <SessionExpirationWarningOverlay warnUserSecondsBeforeAutoLogout={45} />
            </AppContexts>
        </AdminClientContext.Provider>
    );
};
