import { useQuery } from "@tanstack/react-query";
import { searchUsers } from "../../api/shared";
import { useAdminClient } from "../../app/admin-client";
import { sharedKeys } from "./keys";

export function useUsersSearch(search: string) {
    const { adminClient } = useAdminClient();
    return useQuery({
        queryKey: sharedKeys.users.search(search),
        queryFn: () => searchUsers(adminClient, search)
    });
}
