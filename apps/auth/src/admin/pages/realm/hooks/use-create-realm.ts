import type RealmRepresentation from "@keycloak/keycloak-admin-client/lib/defs/realmRepresentation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createRealm } from "../../../api/realm";
import { realmKeys } from "./keys";

export function useCreateRealm() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (realm: RealmRepresentation) => createRealm(realm),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: realmKeys.all });
        }
    });
}
