import { useQuery } from "@tanstack/react-query";
import { findClientScope } from "../../../api/client-scopes";
import { useAdminClient } from "../../../app/admin-client";
import { clientScopeKeys } from "./keys";

export function useClientScope(id: string) {
    const { adminClient } = useAdminClient();
    return useQuery({
        queryKey: clientScopeKeys.detail(id),
        queryFn: () => findClientScope(adminClient, id),
        enabled: !!id
    });
}
