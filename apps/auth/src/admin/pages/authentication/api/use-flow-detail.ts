import { useQuery } from "@tanstack/react-query";
import { useAdminClient } from "../../../app/admin-client";
import { fetchFlowDetail } from "../../../api/authentication";
import { authenticationKeys } from "./keys";

export function useFlowDetail(id: string | undefined) {
    const { adminClient } = useAdminClient();
    return useQuery({
        queryKey: authenticationKeys.flowDetail(id!),
        queryFn: () => fetchFlowDetail(adminClient, id!),
        enabled: !!id
    });
}
