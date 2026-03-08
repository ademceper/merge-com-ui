import { useQuery } from "@tanstack/react-query";
import { type FilterType, fetchSessions } from "../../../api/sessions";
import { sessionKeys } from "./keys";

export function useSessions(filterType: FilterType) {
    return useQuery({
        queryKey: sessionKeys.list(filterType),
        queryFn: () => fetchSessions(filterType)
    });
}
