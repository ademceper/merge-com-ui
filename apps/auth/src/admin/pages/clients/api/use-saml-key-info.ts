import { useQuery } from "@tanstack/react-query";
import { fetchSamlKeyInfo } from "../../../api/clients";
import { useAdminClient } from "../../../app/admin-client";
import { clientKeys } from "./keys";

export function useSamlKeyInfo(clientId: string) {
    const { adminClient } = useAdminClient();
    return useQuery({
        queryKey: clientKeys.samlKeys(clientId),
        queryFn: () => fetchSamlKeyInfo(adminClient, clientId)
    });
}
