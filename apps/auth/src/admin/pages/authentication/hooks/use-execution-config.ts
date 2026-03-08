import { useQuery } from "@tanstack/react-query";
import { useAdminClient } from "../../../app/admin-client";
import { fetchExecutionConfig } from "../../../api/authentication";
import { authenticationKeys } from "./keys";

export function useExecutionConfig(execution: {
    id?: string;
    providerId?: string;
    authenticationConfig?: string;
    configurable?: boolean;
    authenticationFlow?: boolean;
    displayName?: string;
}) {
    const { adminClient } = useAdminClient();
    return useQuery({
        queryKey: authenticationKeys.executionConfig(execution.id!),
        queryFn: () => fetchExecutionConfig(adminClient, execution),
        enabled: !!execution.id
    });
}
