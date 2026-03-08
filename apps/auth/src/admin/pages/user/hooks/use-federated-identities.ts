import { useQuery } from "@tanstack/react-query";
import { fetchFederatedIdentities } from "../../../api/users";
import { useAdminClient } from "../../../app/admin-client";
import { userKeys } from "./keys";

export function useFederatedIdentities(userId: string) {
    const { adminClient } = useAdminClient();
    return useQuery({
        queryKey: userKeys.federatedIdentities(userId),
        queryFn: () => fetchFederatedIdentities(adminClient, userId),
        enabled: !!userId
    });
}
