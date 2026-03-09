import { useQuery } from "@tanstack/react-query";
import { fetchServiceAccountUser } from "@/admin/api/clients";
import { clientKeys } from "./keys";

export function useServiceAccountUser(clientId: string) {
    return useQuery({
        queryKey: clientKeys.serviceAccount(clientId),
        queryFn: () => fetchServiceAccountUser(clientId)
    });
}
