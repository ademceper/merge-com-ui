import { useQuery } from "@tanstack/react-query";
import { useAdminClient } from "../../../app/admin-client";
import { fetchStepProviders } from "../../../api/authentication";
import type { FlowType } from "../../../api/authentication";
import { authenticationKeys } from "./keys";

export function useStepProviders(type: FlowType) {
    const { adminClient } = useAdminClient();
    return useQuery({
        queryKey: authenticationKeys.stepProviders(type),
        queryFn: () => fetchStepProviders(adminClient, type)
    });
}
