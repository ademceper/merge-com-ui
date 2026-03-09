import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRealm } from "@/admin/app/providers/realm-context/realm-context";
import { deleteComponent } from "@/admin/api/realm-settings";
import { realmSettingsKeys } from "./keys";

export function useDeleteComponent() {
    const { realm } = useRealm();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => deleteComponent(id, realm),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: realmSettingsKeys.all
            });
        }
    });
}
