import { useQuery } from "@tanstack/react-query";
import { fetchDedicatedScopeClient } from "../../../api/clients";
import { clientKeys } from "./keys";

export function useDedicatedScopeClient(clientId: string) {
    return useQuery({
        queryKey: [...clientKeys.detail(clientId), "dedicated-scope"] as const,
        queryFn: () => fetchDedicatedScopeClient(clientId)
    });
}
