import { useQuery } from "@tanstack/react-query";
import { searchUsers } from "@/admin/api/shared";
import { sharedKeys } from "./keys";

export function useUsersSearch(search: string) {
    return useQuery({
        queryKey: sharedKeys.users.search(search),
        queryFn: () => searchUsers(search),
        enabled: search.length > 0
    });
}
