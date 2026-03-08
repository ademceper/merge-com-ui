import { useQuery } from "@tanstack/react-query";
import { findRoleDetails } from "../../../api/permissions";
import { useAdminClient } from "../../../app/admin-client";
import { permissionsKeys } from "./keys";

export function useRoleDetails(ids: string[]) {
    const { adminClient } = useAdminClient();
    const sortedIds = [...ids].sort();
    return useQuery({
        queryKey: permissionsKeys.roleDetails(sortedIds),
        queryFn: () => findRoleDetails(adminClient, ids),
        enabled: ids.length > 0
    });
}
