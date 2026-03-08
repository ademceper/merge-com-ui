import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateClientScope } from "../../../api/client-scopes";
import {
    type AllClientScopeType,
    changeScope
} from "../../../shared/ui/client-scope/client-scope-types";
import type { ClientScopeDefaultOptionalType } from "../../../shared/ui/client-scope/client-scope-types";
import { clientScopeKeys } from "./keys";

export function useUpdateClientScope(id: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (
            clientScope: ClientScopeDefaultOptionalType & { type?: AllClientScopeType }
        ) => {
            await updateClientScope(id, clientScope);
            await changeScope({ ...clientScope, id }, clientScope.type);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: clientScopeKeys.detail(id)
            });
            queryClient.invalidateQueries({
                queryKey: clientScopeKeys.lists()
            });
        }
    });
}
