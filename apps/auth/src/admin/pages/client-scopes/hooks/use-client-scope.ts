import { useQuery } from "@tanstack/react-query";
import { findClientScope } from "@/admin/api/client-scopes";
import { clientScopeKeys } from "./keys";

export function useClientScope(id: string) {
    return useQuery({
        queryKey: clientScopeKeys.detail(id),
        queryFn: () => findClientScope(id),
        enabled: !!id
    });
}
