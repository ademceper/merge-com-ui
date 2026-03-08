import { useQuery } from "@tanstack/react-query";
import { fetchUserProfileMetadata } from "../../../api/users";
import { useAdminClient } from "../../../app/admin-client";
import { userKeys } from "./keys";

export function useUserProfileMetadata(realm: string) {
    const { adminClient } = useAdminClient();
    return useQuery({
        queryKey: userKeys.profileMetadata(realm),
        queryFn: () => fetchUserProfileMetadata(adminClient, realm)
    });
}
