import type WhoAmIRepresentation from "@keycloak/keycloak-admin-client/lib/defs/whoAmIRepresentation";
import { DEFAULT_LOCALE } from "@merge-rd/i18n";
import { useQuery } from "@tanstack/react-query";
import type { PropsWithChildren } from "react";
import { KeycloakSpinner, useEnvironment } from "@/shared/keycloak-ui-shared";
import { useAdminClient } from "../admin-client";
import { useRealm } from "./realm-context/realm-context";

/**
 * Prefetches ServerInfo and WhoAmI data in parallel after RealmContext is ready.
 * This eliminates the serial waterfall where each provider blocks the next.
 *
 * Flow: RealmContext (blocking) → [ServerInfo + WhoAmI in parallel] → providers read from cache
 */
export const BootstrapPrefetch = ({ children }: PropsWithChildren) => {
    const { adminClient } = useAdminClient();
    const { realm } = useRealm();
    const { environment } = useEnvironment();

    // Prefetch ServerInfo - same queryKey as ServerInfoProvider
    const { data: serverInfo } = useQuery({
        queryKey: ["serverInfo"],
        queryFn: () => adminClient.serverInfo.find(),
        staleTime: Number.POSITIVE_INFINITY
    });

    // Prefetch WhoAmI - same queryKey as WhoAmIContextProvider
    const { data: whoAmI } = useQuery({
        queryKey: ["whoAmI", environment.realm, realm],
        staleTime: Number.POSITIVE_INFINITY,
        queryFn: async (): Promise<WhoAmIRepresentation> => {
            try {
                return await adminClient.whoAmI.find({
                    realm: environment.realm,
                    currentRealm: realm
                });
            } catch (error) {
                console.warn(
                    "Unable to fetch whoami, falling back to empty defaults.",
                    error
                );

                return {
                    realm: "",
                    userId: "",
                    displayName: "",
                    locale: DEFAULT_LOCALE,
                    createRealm: false,
                    realm_access: {},
                    temporary: false
                };
            }
        }
    });

    if (!serverInfo || !whoAmI) {
        return <KeycloakSpinner />;
    }

    return <>{children}</>;
};
