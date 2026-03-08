import { useQuery } from "@tanstack/react-query";
import { fetchUserCredentials } from "../../../api/users";
import { useAdminClient } from "../../../app/admin-client";
import { userKeys } from "./keys";

export function useUserCredentials(userId: string, enabled: boolean) {
    const { adminClient } = useAdminClient();
    return useQuery({
        queryKey: userKeys.credentials(userId),
        queryFn: () => {
            if (enabled) {
                return fetchUserCredentials(adminClient, userId);
            }
            return Promise.resolve([]);
        },
        enabled: !!userId
    });
}
