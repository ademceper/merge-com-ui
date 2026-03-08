import { useQuery } from "@tanstack/react-query";
import { fetchUserSessions } from "../../../api/users";
import { useAdminClient } from "../../../app/admin-client";
import { userKeys } from "./keys";

export function useUserSessions(id: string, realm: string) {
    const { adminClient } = useAdminClient();
    return useQuery({
        queryKey: userKeys.sessions(id),
        queryFn: () => fetchUserSessions(adminClient, id, realm),
        enabled: !!id
    });
}
