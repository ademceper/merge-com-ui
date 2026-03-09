import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/admin/api/clients";
import { clientKeys } from "./keys";

export function useCreateClient() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (client: Record<string, unknown>) => createClient(client),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: clientKeys.all });
        }
    });
}
