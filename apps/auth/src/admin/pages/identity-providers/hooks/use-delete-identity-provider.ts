import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteIdentityProvider } from "@/admin/api/identity-providers";
import { idpKeys } from "./keys";

export function useDeleteIdentityProvider() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (alias: string) =>
            deleteIdentityProvider(alias),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: idpKeys.all });
        }
    });
}
