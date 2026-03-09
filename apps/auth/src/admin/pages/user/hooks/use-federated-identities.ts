import { useQuery } from "@tanstack/react-query";
import { fetchFederatedIdentities } from "@/admin/api/users";
import { userKeys } from "./keys";

export function useFederatedIdentities(userId: string) {
    return useQuery({
        queryKey: userKeys.federatedIdentities(userId),
        queryFn: () => fetchFederatedIdentities(userId),
        enabled: !!userId
    });
}
