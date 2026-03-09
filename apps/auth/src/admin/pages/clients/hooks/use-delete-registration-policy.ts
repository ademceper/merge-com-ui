import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteRegistrationPolicy } from "@/admin/api/clients";
import { useRealm } from "@/admin/app/providers/realm-context/realm-context";
import { clientKeys } from "./keys";

export function useDeleteRegistrationPolicy() {
    const { realm } = useRealm();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => deleteRegistrationPolicy(realm, id),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: clientKeys.all
            });
        }
    });
}
