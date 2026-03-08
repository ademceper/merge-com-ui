import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAdminClient } from "../../../app/admin-client";
import { useRealm } from "../../../app/providers/realm-context/realm-context";
import { deleteComponent } from "../../../api/realm-settings";
import { realmSettingsKeys } from "./keys";

export function useDeleteComponent() {
    const { adminClient } = useAdminClient();
    const { realm } = useRealm();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => deleteComponent(adminClient, id, realm),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: realmSettingsKeys.all
            });
        }
    });
}
