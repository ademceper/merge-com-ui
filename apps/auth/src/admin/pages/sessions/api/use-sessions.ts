import { useQuery } from "@tanstack/react-query";
import { useAdminClient } from "../../../app/admin-client";
import { type FilterType, fetchSessions } from "../../../api/sessions";
import { sessionKeys } from "./keys";

export function useSessions(filterType: FilterType) {
    const { adminClient } = useAdminClient();
    return useQuery({
        queryKey: sessionKeys.list(filterType),
        queryFn: () => fetchSessions(adminClient, filterType)
    });
}
