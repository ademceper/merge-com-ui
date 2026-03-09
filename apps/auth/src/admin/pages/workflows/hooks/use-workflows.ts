import { useQuery } from "@tanstack/react-query";
import { fetchWorkflows } from "@/admin/api/workflows";
import { workflowKeys } from "./keys";

export function useWorkflows() {
    return useQuery({
        queryKey: workflowKeys.lists(),
        queryFn: () => fetchWorkflows()
    });
}
