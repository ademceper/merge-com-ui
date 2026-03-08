import { useQuery } from "@tanstack/react-query";
import { fetchClientSessions } from "../../../api/clients";
import { clientKeys } from "./keys";

export function useClientSessions(clientId: string) {
    return useQuery({
        queryKey: clientKeys.sessions(clientId),
        queryFn: () => fetchClientSessions(clientId)
    });
}
