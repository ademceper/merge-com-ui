import { useQuery } from "@tanstack/react-query";
import { fetchExecutionConfig } from "@/admin/api/authentication";
import { authenticationKeys } from "./keys";

export function useExecutionConfig(execution: {
    id?: string;
    providerId?: string;
    authenticationConfig?: string;
    configurable?: boolean;
    authenticationFlow?: boolean;
    displayName?: string;
}) {
    return useQuery({
        queryKey: authenticationKeys.executionConfig(execution.id!),
        queryFn: () => fetchExecutionConfig(execution),
        enabled: !!execution.id
    });
}
