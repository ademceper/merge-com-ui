import { useQuery } from "@tanstack/react-query";
import { useAdminClient } from "../../../app/admin-client";
import { fetchWorkflow } from "../../../api/workflows";
import { workflowKeys } from "./keys";

export function useWorkflow(id: string, enabled = true) {
    const { adminClient } = useAdminClient();
    return useQuery({
        queryKey: workflowKeys.detail(id),
        queryFn: () => fetchWorkflow(adminClient, id),
        enabled
    });
}
