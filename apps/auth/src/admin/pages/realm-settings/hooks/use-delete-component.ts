import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRealm } from "../../../app/providers/realm-context/realm-context";
import { deleteComponent } from "../../../api/realm-settings";
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
