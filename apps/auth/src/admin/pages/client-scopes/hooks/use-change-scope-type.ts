import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAdminClient } from "../../../app/admin-client";
import {
    type AllClientScopeType,
    changeScope
} from "../../../shared/ui/client-scope/client-scope-types";
import type { ClientScopeDefaultOptionalType } from "../../../shared/ui/client-scope/client-scope-types";
import { clientScopeKeys } from "./keys";

export function useChangeScopeType() {
    const { adminClient } = useAdminClient();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({
            scope,
            type
        }: {
            scope: ClientScopeDefaultOptionalType;
            type: AllClientScopeType;
        }) => {
            await changeScope(adminClient, scope, type);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: clientScopeKeys.lists()
            });
        }
    });
}
