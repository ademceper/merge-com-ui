import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteRegistrationPolicy } from "../../../api/clients";
import { useAdminClient } from "../../../app/admin-client";
import { useRealm } from "../../../app/providers/realm-context/realm-context";
import { clientKeys } from "./keys";

export function useDeleteRegistrationPolicy() {
    const { adminClient } = useAdminClient();
    const { realm } = useRealm();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => deleteRegistrationPolicy(adminClient, realm, id),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: clientKeys.all
            });
        }
    });
}
