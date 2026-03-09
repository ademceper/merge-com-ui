import { useQuery } from "@tanstack/react-query";
import { fetchStepProviders } from "@/admin/api/authentication";
import type { FlowType } from "@/admin/api/authentication";
import { authenticationKeys } from "./keys";

export function useStepProviders(type: FlowType) {
    return useQuery({
        queryKey: authenticationKeys.stepProviders(type),
        queryFn: () => fetchStepProviders(type)
    });
}
