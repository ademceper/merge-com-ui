import { useQuery } from "@tanstack/react-query";
import { fetchPermissions } from "../../api/shared";
import { useAdminClient } from "../../app/admin-client";
import { useRealm } from "../../app/providers/realm-context/realm-context";
import type { PermissionScreenType } from "./keys";
import { sharedKeys } from "./keys";

export function usePermissions(id: string | undefined, type: PermissionScreenType) {
    const { adminClient } = useAdminClient();
    const { realm } = useRealm();
    return useQuery({
        queryKey: sharedKeys.permissions.detail(id, type, realm),
        queryFn: () => fetchPermissions(adminClient, id, type, realm)
    });
}
