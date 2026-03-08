import { useQuery } from "@tanstack/react-query";
import { fetchDedicatedScopeClient } from "../../../api/clients";
import { useAdminClient } from "../../../app/admin-client";
import { clientKeys } from "./keys";

export function useDedicatedScopeClient(clientId: string) {
    const { adminClient } = useAdminClient();
    return useQuery({
        queryKey: [...clientKeys.detail(clientId), "dedicated-scope"] as const,
        queryFn: () => fetchDedicatedScopeClient(adminClient, clientId)
    });
}
