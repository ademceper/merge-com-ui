import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
    createClientScope as apiCreateClientScope,
    findClientScopeByName
} from "../../../api/client-scopes";
import {
    type AllClientScopeType,
    changeScope
} from "../../../shared/ui/client-scope/client-scope-types";
import type { ClientScopeDefaultOptionalType } from "../../../shared/ui/client-scope/client-scope-types";
import { clientScopeKeys } from "./keys";

export function useCreateClientScope() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (
            clientScope: ClientScopeDefaultOptionalType & { type?: AllClientScopeType }
        ) => {
            await apiCreateClientScope(clientScope);
            const scope = await findClientScopeByName(clientScope.name!);
            if (!scope) {
                throw new Error("Client scope not found after creation");
            }
            await changeScope(
                { ...clientScope, id: scope.id },
                clientScope.type
            );
            return scope;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: clientScopeKeys.lists()
            });
        }
    });
}
