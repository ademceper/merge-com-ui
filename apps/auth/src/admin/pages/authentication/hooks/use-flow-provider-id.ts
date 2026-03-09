import { useQuery } from "@tanstack/react-query";
import { fetchFlowProviderId } from "@/admin/api/authentication";
import { authenticationKeys } from "./keys";

export function useFlowProviderId(flowId: string | undefined) {
    return useQuery({
        queryKey: authenticationKeys.flowProviderId(flowId!),
        queryFn: () => fetchFlowProviderId(flowId!),
        enabled: !!flowId
    });
}
