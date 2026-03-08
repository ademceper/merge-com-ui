import { useQuery } from "@tanstack/react-query";
import { fetchResourceServer } from "../../api/shared";
import { useAdminClient } from "../../app/admin-client";
import { sharedKeys } from "./keys";

export function useResourceServer(clientId: string) {
    const { adminClient } = useAdminClient();
    return useQuery({
        queryKey: sharedKeys.resourceServer.byClient(clientId),
        queryFn: () => fetchResourceServer(adminClient, clientId)
    });
}
