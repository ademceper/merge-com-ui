import { useMutation } from "@tanstack/react-query";
import { useRealm } from "@/admin/app/providers/realm-context/realm-context";
import { updateRealm } from "@/admin/api/realm-settings";

export function useUpdateRealm() {
    const { realm } = useRealm();
    return useMutation({
        mutationFn: (rep: Record<string, unknown>) => updateRealm(realm, rep)
    });
}
