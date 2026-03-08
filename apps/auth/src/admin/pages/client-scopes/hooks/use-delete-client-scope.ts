import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteClientScope as apiDeleteClientScope } from "../../../api/client-scopes";
import { useAdminClient } from "../../../app/admin-client";
import { removeScope } from "../../../shared/ui/client-scope/client-scope-types";
import type { ClientScopeDefaultOptionalType } from "../../../shared/ui/client-scope/client-scope-types";
import { clientScopeKeys } from "./keys";

export function useDeleteClientScope() {
    const { adminClient } = useAdminClient();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (scope: ClientScopeDefaultOptionalType) => {
            await removeScope(adminClient, scope);
            await apiDeleteClientScope(adminClient, scope.id!);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: clientScopeKeys.lists()
            });
        }
    });
}
