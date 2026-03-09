import type RealmRepresentation from "@keycloak/keycloak-admin-client/lib/defs/realmRepresentation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import { type PropsWithChildren, useCallback, useEffect, useMemo } from "react";
import {
    createNamedContext,
    KeycloakSpinner,
    useEnvironment,
    useRequiredContext
} from "@/shared/keycloak-ui-shared";
import { useAdminClient } from "@/admin/app/admin-client";
import { i18n } from "@/admin/app/i18n";

type RealmContextType = {
    realm: string;
    realmRepresentation?: RealmRepresentation;
    refresh: () => void;
};

const RealmContext = createNamedContext<RealmContextType | undefined>(
    "RealmContext",
    undefined
);

export const RealmContextProvider = ({ children }: PropsWithChildren) => {
    const { adminClient } = useAdminClient();
    const { environment } = useEnvironment();
    const queryClient = useQueryClient();

    const { realm: routeRealm } = useParams({ strict: false }) as { realm?: string };
    const realm = routeRealm ?? environment.realm;

    const refresh = useCallback(() => {
        queryClient.invalidateQueries({ queryKey: ["realm", realm] });
    }, [queryClient, realm]);

    // Configure admin client to use selected realm when it changes.
    useEffect(() => {
        void (async () => {
            adminClient.setConfig({ realmName: realm });
            const namespace = encodeURIComponent(realm);
            await i18n.loadNamespaces(namespace);
            i18n.setDefaultNamespace(namespace);
        })();
    }, [realm]);

    const { data: realmRepresentation } = useQuery({
        queryKey: ["realm", realm],
        queryFn: () => adminClient.realms.findOne({ realm }),
        staleTime: 5 * 60_000
    });

    const value = useMemo(
        () => ({ realm, realmRepresentation, refresh }),
        [realm, realmRepresentation, refresh]
    );

    if (!realmRepresentation) {
        return <KeycloakSpinner />;
    }

    return <RealmContext.Provider value={value}>{children}</RealmContext.Provider>;
};

export const useRealm = () => useRequiredContext(RealmContext);
