import { useQuery } from "@tanstack/react-query";
import { fetchUserCredentials } from "../../../api/users";
import { userKeys } from "./keys";

export function useUserCredentials(userId: string, enabled: boolean) {
    return useQuery({
        queryKey: userKeys.credentials(userId),
        queryFn: () => {
            if (enabled) {
                return fetchUserCredentials(userId);
            }
            return Promise.resolve([]);
        },
        enabled: !!userId
    });
}
