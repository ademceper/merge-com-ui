import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateClient } from "../../../api/clients";
import { clientKeys } from "./keys";

export function useUpdateClient() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ clientId, client }: { clientId: string; client: Record<string, unknown> }) =>
            updateClient(clientId, client),
        onSuccess: (_data, { clientId }) => {
            queryClient.invalidateQueries({ queryKey: clientKeys.detail(clientId) });
        }
    });
}
