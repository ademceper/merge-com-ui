import { useQuery } from "@tanstack/react-query";
import { findRealmRole } from "../../../api/realm-roles";
import { useAdminClient } from "../../../app/admin-client";
import { roleKeys } from "./keys";

export function useRealmRole(id: string) {
    const { adminClient } = useAdminClient();
    return useQuery({
        queryKey: roleKeys.detail(id),
        queryFn: () => findRealmRole(adminClient, id)
    });
}
