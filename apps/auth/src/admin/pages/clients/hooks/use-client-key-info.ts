import { useQuery } from "@tanstack/react-query";
import { fetchClientKeyInfo } from "@/admin/api/clients";
import { clientKeys } from "./keys";

export function useClientKeyInfo(clientId: string, attr: string) {
    return useQuery({
        queryKey: clientKeys.keyInfo(clientId, attr),
        queryFn: () => fetchClientKeyInfo(clientId, attr)
    });
}
