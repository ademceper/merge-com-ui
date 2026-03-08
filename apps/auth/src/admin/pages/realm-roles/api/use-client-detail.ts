import { useQuery } from "@tanstack/react-query";
import { findClientDetail } from "../../../api/realm-roles";
import { useAdminClient } from "../../../app/admin-client";
import { roleKeys } from "./keys";

export function useClientDetail(clientId?: string) {
    const { adminClient } = useAdminClient();
    return useQuery({
        queryKey: roleKeys.clientDetail(clientId!),
        queryFn: () => findClientDetail(adminClient, clientId!),
        enabled: !!clientId
    });
}
