import { useQuery } from "@tanstack/react-query";
import { fetchServiceAccountUser } from "../../../api/clients";
import { useAdminClient } from "../../../app/admin-client";
import { clientKeys } from "./keys";

export function useServiceAccountUser(clientId: string) {
    const { adminClient } = useAdminClient();
    return useQuery({
        queryKey: clientKeys.serviceAccount(clientId),
        queryFn: () => fetchServiceAccountUser(adminClient, clientId)
    });
}
