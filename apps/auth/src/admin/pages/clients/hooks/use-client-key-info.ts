import { useQuery } from "@tanstack/react-query";
import { fetchClientKeyInfo } from "../../../api/clients";
import { useAdminClient } from "../../../app/admin-client";
import { clientKeys } from "./keys";

export function useClientKeyInfo(clientId: string, attr: string) {
    const { adminClient } = useAdminClient();
    return useQuery({
        queryKey: clientKeys.keyInfo(clientId, attr),
        queryFn: () => fetchClientKeyInfo(adminClient, clientId, attr)
    });
}
