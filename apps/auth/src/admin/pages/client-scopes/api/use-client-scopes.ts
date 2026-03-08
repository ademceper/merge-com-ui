import { useQuery } from "@tanstack/react-query";
import { findClientScopes } from "../../../api/client-scopes";
import { useAdminClient } from "../../../app/admin-client";
import { clientScopeKeys } from "./keys";

export function useClientScopes() {
    const { adminClient } = useAdminClient();
    return useQuery({
        queryKey: clientScopeKeys.lists(),
        queryFn: () => findClientScopes(adminClient)
    });
}
