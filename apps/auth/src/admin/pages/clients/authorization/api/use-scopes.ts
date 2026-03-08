import { useQuery } from "@tanstack/react-query";
import { listAllScopes } from "../../../../api/client-authorization";
import { useAdminClient } from "../../../../app/admin-client";
import { authzKeys } from "./keys";

export function useScopes(clientId: string, first: number, max: number, search: string) {
    const { adminClient } = useAdminClient();
    return useQuery({
        queryKey: authzKeys.scopes(clientId, first, max, search),
        queryFn: () => {
            const params = {
                first,
                max: max + 1,
                deep: false,
                name: search
            };
            return listAllScopes(adminClient, clientId, params);
        }
    });
}
