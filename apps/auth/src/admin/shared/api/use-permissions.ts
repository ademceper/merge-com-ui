import { useQuery } from "@tanstack/react-query";
import { fetchPermissions } from "../../api/shared";
import { useRealm } from "../../app/providers/realm-context/realm-context";
import type { PermissionScreenType } from "./keys";
import { sharedKeys } from "./keys";

export function usePermissions(id: string | undefined, type: PermissionScreenType) {
    const { realm } = useRealm();
    return useQuery({
        queryKey: sharedKeys.permissions.detail(id, type, realm),
        queryFn: () => fetchPermissions(id, type, realm)
    });
}
