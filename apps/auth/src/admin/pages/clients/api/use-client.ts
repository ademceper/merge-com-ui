import { useQuery } from "@tanstack/react-query";
import { findClient } from "../../../api/clients";
import { useAdminClient } from "../../../app/admin-client";
import { clientKeys } from "./keys";

export function useClient(clientId: string) {
    const { adminClient } = useAdminClient();
    return useQuery({
        queryKey: clientKeys.detail(clientId),
        queryFn: () => findClient(adminClient, clientId)
    });
}
