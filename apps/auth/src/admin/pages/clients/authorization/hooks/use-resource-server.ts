import { useQuery } from "@tanstack/react-query";
import { getResourceServer } from "../../../../api/client-authorization";
import { useAdminClient } from "../../../../app/admin-client";
import { authzKeys } from "./keys";

export function useResourceServer(clientId: string) {
    const { adminClient } = useAdminClient();
    return useQuery({
        queryKey: authzKeys.resourceServer(clientId),
        queryFn: () => getResourceServer(adminClient, clientId)
    });
}
