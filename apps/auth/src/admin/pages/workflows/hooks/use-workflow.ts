import { useQuery } from "@tanstack/react-query";
import { fetchWorkflow } from "../../../api/workflows";
import { workflowKeys } from "./keys";

export function useWorkflow(id: string, enabled = true) {
    return useQuery({
        queryKey: workflowKeys.detail(id),
        queryFn: () => fetchWorkflow(id),
        enabled
    });
}
