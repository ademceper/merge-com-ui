import type RealmRepresentation from "@keycloak/keycloak-admin-client/lib/defs/realmRepresentation";
import { useMutation } from "@tanstack/react-query";
import { useRealm } from "../../../app/providers/realm-context/realm-context";
import { updateRealm } from "../../../api/authentication";

export function useUpdateRealmPolicy() {
    const { realm: realmName } = useRealm();
    return useMutation({
        mutationFn: (realmData: RealmRepresentation) =>
            updateRealm(realmName, realmData)
    });
}
