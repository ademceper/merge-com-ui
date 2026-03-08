import { useMutation } from "@tanstack/react-query";
import { useRealm } from "../../../app/providers/realm-context/realm-context";
import { pushRevocation, updateRealmNotBefore } from "../../../api/sessions";

export function useSetNotBeforeToNow() {
    const { realm } = useRealm();
    return useMutation({
        mutationFn: () => updateRealmNotBefore(realm, Date.now() / 1000)
    });
}

export function useClearNotBefore() {
    const { realm } = useRealm();
    return useMutation({
        mutationFn: () => updateRealmNotBefore(realm, 0)
    });
}

export function usePushRevocation() {
    const { realm } = useRealm();
    return useMutation({
        mutationFn: () => pushRevocation(realm)
    });
}
