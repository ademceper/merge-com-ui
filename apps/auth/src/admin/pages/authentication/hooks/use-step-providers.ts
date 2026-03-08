import { useQuery } from "@tanstack/react-query";
import { fetchStepProviders } from "../../../api/authentication";
import type { FlowType } from "../../../api/authentication";
import { authenticationKeys } from "./keys";

export function useStepProviders(type: FlowType) {
    return useQuery({
        queryKey: authenticationKeys.stepProviders(type),
        queryFn: () => fetchStepProviders(type)
    });
}
