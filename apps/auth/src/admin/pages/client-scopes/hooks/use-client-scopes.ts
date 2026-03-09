import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { findClientScopes } from "@/admin/api/client-scopes";
import { clientScopeKeys } from "./keys";

export const clientScopesQueryOptions = () =>
    queryOptions({
        queryKey: clientScopeKeys.lists(),
        queryFn: () => findClientScopes()
    });

export function useClientScopes() {
    return useSuspenseQuery(clientScopesQueryOptions());
}
