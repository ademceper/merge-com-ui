import { useQuery } from "@tanstack/react-query";
import { findGroupDetails } from "../../../api/permissions";
import { useAdminClient } from "../../../app/admin-client";
import { permissionsKeys } from "./keys";

export function useGroupDetails(ids: string[]) {
    const { adminClient } = useAdminClient();
    const sortedIds = [...ids].sort();
    return useQuery({
        queryKey: permissionsKeys.groupDetails(sortedIds),
        queryFn: () => findGroupDetails(adminClient, ids),
        enabled: ids.length > 0
    });
}
