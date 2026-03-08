import { useMutation } from "@tanstack/react-query";
import { useRealm } from "../../../app/providers/realm-context/realm-context";
import { updateRealm } from "../../../api/realm-settings";

export function useUpdateRealm() {
    const { realm } = useRealm();
    return useMutation({
        mutationFn: (rep: Record<string, unknown>) => updateRealm(realm, rep)
    });
}
