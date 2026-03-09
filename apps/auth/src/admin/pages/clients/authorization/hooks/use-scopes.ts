import { useQuery } from "@tanstack/react-query";
import { listAllScopes } from "@/admin/api/client-authorization";
import { authzKeys } from "./keys";

export function useScopes(clientId: string, first: number, max: number, search: string) {
    return useQuery({
        queryKey: authzKeys.scopes(clientId, first, max, search),
        queryFn: () => {
            const params = {
                first,
                max: max + 1,
                deep: false,
                name: search
            };
            return listAllScopes(clientId, params);
        }
    });
}
