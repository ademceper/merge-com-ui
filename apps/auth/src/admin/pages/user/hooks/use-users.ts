import { useQuery } from "@tanstack/react-query";
import { findUsers } from "@/admin/api/users";
import { userKeys } from "./keys";

export function useUsers() {
    return useQuery({
        queryKey: userKeys.lists(),
        queryFn: () => findUsers()
    });
}
