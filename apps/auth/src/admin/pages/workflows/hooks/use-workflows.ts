import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { fetchWorkflows } from "@/admin/api/workflows";
import { workflowKeys } from "./keys";

export const workflowsQueryOptions = () =>
    queryOptions({
        queryKey: workflowKeys.lists(),
        queryFn: () => fetchWorkflows()
    });

export function useWorkflows() {
    return useSuspenseQuery(workflowsQueryOptions());
}
