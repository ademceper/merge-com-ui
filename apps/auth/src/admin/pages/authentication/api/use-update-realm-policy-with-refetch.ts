import type RealmRepresentation from "@keycloak/keycloak-admin-client/lib/defs/realmRepresentation";
import { useMutation } from "@tanstack/react-query";
import { useAdminClient } from "../../../app/admin-client";
import { useRealm } from "../../../app/providers/realm-context/realm-context";
import { updateRealmWithRefetch } from "../../../api/authentication";

export function useUpdateRealmPolicyWithRefetch() {
    const { adminClient } = useAdminClient();
    const { realm: realmName } = useRealm();
    return useMutation({
        mutationFn: (realmData: RealmRepresentation) =>
            updateRealmWithRefetch(adminClient, realmName, realmData)
    });
}
