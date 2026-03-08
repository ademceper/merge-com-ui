import type RealmRepresentation from "@keycloak/keycloak-admin-client/lib/defs/realmRepresentation";
import { useMutation } from "@tanstack/react-query";
import { useRealm } from "../../../app/providers/realm-context/realm-context";
import { updateRealm } from "../../../api/authentication";

export function useBindFlow() {
    const { realm, realmRepresentation: realmRep } = useRealm();
    return useMutation({
        mutationFn: ({
            flowAlias,
            bindingType
        }: {
            flowAlias: string;
            bindingType: keyof RealmRepresentation;
        }) =>
            updateRealm(realm, {
                ...realmRep,
                [bindingType]: flowAlias
            })
    });
}
