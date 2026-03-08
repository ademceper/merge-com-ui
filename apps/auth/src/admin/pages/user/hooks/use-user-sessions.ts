import { useQuery } from "@tanstack/react-query";
import { fetchUserSessions } from "../../../api/users";
import { userKeys } from "./keys";

export function useUserSessions(id: string, realm: string) {
    return useQuery({
        queryKey: userKeys.sessions(id),
        queryFn: () => fetchUserSessions(id, realm),
        enabled: !!id
    });
}
