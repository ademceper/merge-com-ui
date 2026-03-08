import { useQuery } from "@tanstack/react-query";
import { listAllScopes } from "../../../../api/client-authorization";
import { useAdminClient } from "../../../../app/admin-client";
import { authzKeys } from "./keys";

export function useScopePickerScopes(clientId: string, search: string) {
    const { adminClient } = useAdminClient();
    return useQuery({
        queryKey: authzKeys.scopePicker(clientId, search),
        queryFn: () => {
            const params = {
                first: 0,
                max: 20,
                deep: false,
                name: search
            };
            return listAllScopes(adminClient, clientId, params);
        }
    });
}
