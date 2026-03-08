import { useQuery } from "@tanstack/react-query";
import { findRoles } from "../../../../api/client-authorization";
import { useAdminClient } from "../../../../app/admin-client";
import { authzKeys } from "./keys";

export function useRoles() {
    const { adminClient } = useAdminClient();
    return useQuery({
        queryKey: authzKeys.roles(),
        queryFn: () => findRoles(adminClient)
    });
}
