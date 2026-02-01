/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/context/server-info/ServerInfoProvider.tsx"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import type { ServerInfoRepresentation } from "@keycloak/keycloak-admin-client/lib/defs/serverInfoRepesentation";
import {
    createNamedContext,
    KeycloakSpinner,
    useFetch,
    useRequiredContext
} from "../../../shared/keycloak-ui-shared";
import { PropsWithChildren, useState } from "react";
import { useAdminClient } from "../../admin-client";
import { sortProviders } from "../../util";

export const ServerInfoContext = createNamedContext<ServerInfoRepresentation | undefined>(
    "ServerInfoContext",
    undefined
);

export const useServerInfo = () => useRequiredContext(ServerInfoContext);

export const useLoginProviders = () =>
    sortProviders(useServerInfo().providers!["login-protocol"].providers);

export const ServerInfoProvider = ({ children }: PropsWithChildren) => {
    const { adminClient } = useAdminClient();
    const [serverInfo, setServerInfo] = useState<ServerInfoRepresentation>();

    useFetch(() => adminClient.serverInfo.find(), setServerInfo, []);

    if (!serverInfo) {
        return <KeycloakSpinner />;
    }

    return (
        <ServerInfoContext.Provider value={serverInfo}>
            {children}
        </ServerInfoContext.Provider>
    );
};
