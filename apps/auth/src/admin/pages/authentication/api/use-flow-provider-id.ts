import { useQuery } from "@tanstack/react-query";
import { useAdminClient } from "../../../app/admin-client";
import { fetchFlowProviderId } from "../../../api/authentication";
import { authenticationKeys } from "./keys";

export function useFlowProviderId(flowId: string | undefined) {
    const { adminClient } = useAdminClient();
    return useQuery({
        queryKey: authenticationKeys.flowProviderId(flowId!),
        queryFn: () => fetchFlowProviderId(adminClient, flowId!),
        enabled: !!flowId
    });
}
