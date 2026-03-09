import type { ServerInfoRepresentation } from "@keycloak/keycloak-admin-client/lib/defs/serverInfoRepesentation";
import { useQuery } from "@tanstack/react-query";
import type { PropsWithChildren } from "react";
import {
    createNamedContext,
    KeycloakSpinner,
    useRequiredContext
} from "@/shared/keycloak-ui-shared";
import { sortProviders } from "@/admin/shared/lib/util";
import { useAdminClient } from "@/admin/app/admin-client";

const ServerInfoContext = createNamedContext<ServerInfoRepresentation | undefined>(
    "ServerInfoContext",
    undefined
);

export const useServerInfo = () => useRequiredContext(ServerInfoContext);

export const useLoginProviders = () =>
    sortProviders(useServerInfo().providers!["login-protocol"].providers);

export const ServerInfoProvider = ({ children }: PropsWithChildren) => {
    const { adminClient } = useAdminClient();

    const { data: serverInfo } = useQuery({
        queryKey: ["serverInfo"],
        queryFn: () => adminClient.serverInfo.find(),
        staleTime: Number.POSITIVE_INFINITY
    });

    if (!serverInfo) {
        return <KeycloakSpinner />;
    }

    return (
        <ServerInfoContext.Provider value={serverInfo}>
            {children}
        </ServerInfoContext.Provider>
    );
};
