import { useQuery } from "@tanstack/react-query";
import { fetchUsedBy } from "@/admin/shared/ui/role-mapping/resource";
import { authenticationKeys } from "./keys";

export function useUsedBy(id: string, isSpecificClient: boolean) {
    return useQuery({
        queryKey: authenticationKeys.usedBy(id, isSpecificClient ? "clients" : "idp"),
        queryFn: () =>
            fetchUsedBy({
                id,
                type: isSpecificClient ? "clients" : "idp",
                first: 0,
                max: 500,
                search: undefined
            }).then(names => names.map(name => ({ name }))),
        enabled: !!id
    });
}
