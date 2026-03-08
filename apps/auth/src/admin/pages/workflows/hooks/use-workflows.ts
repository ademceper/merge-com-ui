import { useQuery } from "@tanstack/react-query";
import { useAdminClient } from "../../../app/admin-client";
import { fetchWorkflows } from "../../../api/workflows";
import { workflowKeys } from "./keys";

export function useWorkflows() {
    const { adminClient } = useAdminClient();
    return useQuery({
        queryKey: workflowKeys.lists(),
        queryFn: () => fetchWorkflows(adminClient)
    });
}
