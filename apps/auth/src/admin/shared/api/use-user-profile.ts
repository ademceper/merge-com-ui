import { useQuery } from "@tanstack/react-query";
import { fetchUserProfile } from "../../api/shared";
import { useAdminClient } from "../../app/admin-client";
import { sharedKeys } from "./keys";

export function useUserProfile() {
    const { adminClient } = useAdminClient();
    return useQuery({
        queryKey: sharedKeys.users.profile(),
        queryFn: () => fetchUserProfile(adminClient)
    });
}
