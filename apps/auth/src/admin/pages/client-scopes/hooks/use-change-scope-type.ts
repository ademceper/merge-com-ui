import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
    type AllClientScopeType,
    changeScope
} from "@/admin/shared/ui/client-scope/client-scope-types";
import type { ClientScopeDefaultOptionalType } from "@/admin/shared/ui/client-scope/client-scope-types";
import { clientScopeKeys } from "./keys";

export function useChangeScopeType() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({
            scope,
            type
        }: {
            scope: ClientScopeDefaultOptionalType;
            type: AllClientScopeType;
        }) => {
            await changeScope(scope, type);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: clientScopeKeys.lists()
            });
        }
    });
}
