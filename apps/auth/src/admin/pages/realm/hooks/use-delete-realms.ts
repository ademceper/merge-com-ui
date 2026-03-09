import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteRealms } from "@/admin/api/realm";
import { realmKeys } from "./keys";

export function useDeleteRealms() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (realmNames: string[]) => deleteRealms(realmNames),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: realmKeys.all });
        }
    });
}
