import { useQuery } from "@tanstack/react-query";
import { getResourceServer } from "@/admin/api/client-authorization";
import { authzKeys } from "./keys";

export function useResourceServer(clientId: string) {
    return useQuery({
        queryKey: authzKeys.resourceServer(clientId),
        queryFn: () => getResourceServer(clientId)
    });
}
