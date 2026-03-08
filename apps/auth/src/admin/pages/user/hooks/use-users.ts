import { useQuery } from "@tanstack/react-query";
import { findUsers } from "../../../api/users";
import { useAdminClient } from "../../../app/admin-client";
import { userKeys } from "./keys";

export function useUsers() {
    const { adminClient } = useAdminClient();
    return useQuery({
        queryKey: userKeys.lists(),
        queryFn: () => findUsers(adminClient)
    });
}
