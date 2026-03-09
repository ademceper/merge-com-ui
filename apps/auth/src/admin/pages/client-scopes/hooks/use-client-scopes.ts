import { useQuery } from "@tanstack/react-query";
import { findClientScopes } from "@/admin/api/client-scopes";
import { clientScopeKeys } from "./keys";

export function useClientScopes() {
    return useQuery({
        queryKey: clientScopeKeys.lists(),
        queryFn: () => findClientScopes()
    });
}
