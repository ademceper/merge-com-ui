import { useQuery } from "@tanstack/react-query";
import { fetchClientSessions } from "../../../api/clients";
import { useAdminClient } from "../../../app/admin-client";
import { clientKeys } from "./keys";

export function useClientSessions(clientId: string) {
    const { adminClient } = useAdminClient();
    return useQuery({
        queryKey: clientKeys.sessions(clientId),
        queryFn: () => fetchClientSessions(adminClient, clientId)
    });
}
