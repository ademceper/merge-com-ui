import { useQuery } from "@tanstack/react-query";
import { listResources } from "../../../../api/client-authorization";
import { useAdminClient } from "../../../../app/admin-client";
import { authzKeys } from "./keys";

export function useResources(
    clientId: string,
    first: number,
    max: number,
    search: Record<string, unknown>
) {
    const { adminClient } = useAdminClient();
    return useQuery({
        queryKey: authzKeys.resources(clientId, first, max, search),
        queryFn: () => {
            const params = {
                first,
                max: max + 1,
                deep: false,
                ...search
            };
            return listResources(adminClient, clientId, params);
        }
    });
}
