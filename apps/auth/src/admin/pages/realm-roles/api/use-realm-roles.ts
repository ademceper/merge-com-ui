import { useQuery } from "@tanstack/react-query";
import { findRealmRoles } from "../../../api/realm-roles";
import { useAdminClient } from "../../../app/admin-client";
import { roleKeys } from "./keys";

export function useRealmRoles() {
    const { adminClient } = useAdminClient();
    return useQuery({
        queryKey: roleKeys.lists(),
        queryFn: () => findRealmRoles(adminClient)
    });
}
