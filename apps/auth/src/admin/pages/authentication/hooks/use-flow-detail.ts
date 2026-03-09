import { useQuery } from "@tanstack/react-query";
import { fetchFlowDetail } from "@/admin/api/authentication";
import { authenticationKeys } from "./keys";

export function useFlowDetail(id: string | undefined) {
    return useQuery({
        queryKey: authenticationKeys.flowDetail(id!),
        queryFn: () => fetchFlowDetail(id!),
        enabled: !!id
    });
}
