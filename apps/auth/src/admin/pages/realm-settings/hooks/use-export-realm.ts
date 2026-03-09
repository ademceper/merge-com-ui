import { useMutation } from "@tanstack/react-query";
import { useRealm } from "@/admin/app/providers/realm-context/realm-context";
import { exportRealm } from "@/admin/api/realm-settings";

export function useExportRealm() {
    const { realm } = useRealm();
    return useMutation({
        mutationFn: (options: { exportClients?: boolean; exportGroupsAndRoles?: boolean }) =>
            exportRealm(realm, options)
    });
}
