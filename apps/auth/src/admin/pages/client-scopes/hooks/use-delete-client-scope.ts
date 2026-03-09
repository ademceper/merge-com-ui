import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteClientScope as apiDeleteClientScope } from "@/admin/api/client-scopes";
import { removeScope } from "@/admin/shared/ui/client-scope/client-scope-types";
import type { ClientScopeDefaultOptionalType } from "@/admin/shared/ui/client-scope/client-scope-types";
import { clientScopeKeys } from "./keys";

export function useDeleteClientScope() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (scope: ClientScopeDefaultOptionalType) => {
            await removeScope(scope);
            await apiDeleteClientScope(scope.id!);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: clientScopeKeys.lists()
            });
        }
    });
}
