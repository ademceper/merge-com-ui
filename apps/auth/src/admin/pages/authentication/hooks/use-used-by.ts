import { useQuery } from "@tanstack/react-query";
import { useAdminClient } from "../../../app/admin-client";
import { fetchUsedBy } from "../../../shared/ui/role-mapping/resource";
import { authenticationKeys } from "./keys";

export function useUsedBy(id: string, isSpecificClient: boolean) {
    const { adminClient } = useAdminClient();
    return useQuery({
        queryKey: authenticationKeys.usedBy(id, isSpecificClient ? "clients" : "idp"),
        queryFn: () =>
            fetchUsedBy(adminClient, {
                id,
                type: isSpecificClient ? "clients" : "idp",
                first: 0,
                max: 500,
                search: undefined
            }).then(names => names.map(name => ({ name }))),
        enabled: !!id
    });
}
