import type ComponentRepresentation from "@keycloak/keycloak-admin-client/lib/defs/componentRepresentation";
import type { KeyMetadataRepresentation } from "@keycloak/keycloak-admin-client/lib/defs/keyMetadataRepresentation";
import { useQuery } from "@tanstack/react-query";
import { useAdminClient } from "../../../app/admin-client";
import { useRealm } from "../../../app/providers/realm-context/realm-context";
import { fetchKeysMetadata } from "../../../api/realm-settings";
import { realmSettingsKeys } from "./keys";

type KeyData = KeyMetadataRepresentation & {
    provider?: string;
};

export function useKeysMetadata(realmComponents: ComponentRepresentation[]) {
    const { adminClient } = useAdminClient();
    const { realm } = useRealm();
    return useQuery({
        queryKey: realmSettingsKeys.keysMetadata(realm),
        queryFn: async () => {
            const keysMetaData = await fetchKeysMetadata(adminClient, realm);
            return (
                keysMetaData.keys?.map(key => {
                    const provider = realmComponents.find(
                        (c: ComponentRepresentation) => c.id === key.providerId
                    );
                    return { ...key, provider: provider?.name } as KeyData;
                }) ?? []
            );
        }
    });
}
