import RealmRepresentation from "@keycloak/keycloak-admin-client/lib/defs/realmRepresentation";
import {
    createNamedContext,
    KeycloakSpinner,
    useEnvironment,
    useFetch,
    useRequiredContext
} from "../../../../shared/keycloak-ui-shared";
import { PropsWithChildren, useEffect, useState } from "react";
import { useParams } from "@tanstack/react-router";
import { useAdminClient } from "../../admin-client";
import { i18n } from "../../i18n";

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
    const [key, setKey] = useState(0);
    const refresh = () => setKey(key + 1);
    const [realmRepresentation, setRealmRepresentation] = useState<RealmRepresentation>();

    const { realm: routeRealm } = useParams({ strict: false }) as { realm?: string };
    const realm = routeRealm ?? environment.realm;

    // Configure admin client to use selected realm when it changes.
    useEffect(() => {
        void (async () => {
            adminClient.setConfig({ realmName: realm });
            const namespace = encodeURIComponent(realm);
            await i18n.loadNamespaces(namespace);
            i18n.setDefaultNamespace(namespace);
        })();
    }, [realm]);
    useFetch(() => adminClient.realms.findOne({ realm }), setRealmRepresentation, [
        realm,
        key
    ]);

    if (!realmRepresentation) {
        return <KeycloakSpinner />;
    }

    return (
        <RealmContext.Provider value={{ realm, realmRepresentation, refresh }}>
            {children}
        </RealmContext.Provider>
    );
};

export const useRealm = () => useRequiredContext(RealmContext);
