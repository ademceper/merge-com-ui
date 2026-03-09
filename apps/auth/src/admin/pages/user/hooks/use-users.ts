import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { findUsers } from "@/admin/api/users";
import { userKeys } from "./keys";

export const usersQueryOptions = () =>
    queryOptions({
        queryKey: userKeys.lists(),
        queryFn: () => findUsers()
    });

export function useUsers() {
    return useSuspenseQuery(usersQueryOptions());
}
