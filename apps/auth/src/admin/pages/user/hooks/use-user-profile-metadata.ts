import { useQuery } from "@tanstack/react-query";
import { fetchUserProfileMetadata } from "../../../api/users";
import { userKeys } from "./keys";

export function useUserProfileMetadata(realm: string) {
    return useQuery({
        queryKey: userKeys.profileMetadata(realm),
        queryFn: () => fetchUserProfileMetadata(realm)
    });
}
