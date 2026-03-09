import { useQuery } from "@tanstack/react-query";
import { listAllScopes } from "@/admin/api/client-authorization";
import { authzKeys } from "./keys";

export function useScopePickerScopes(clientId: string, search: string) {
    return useQuery({
        queryKey: authzKeys.scopePicker(clientId, search),
        queryFn: () => {
            const params = {
                first: 0,
                max: 20,
                deep: false,
                name: search
            };
            return listAllScopes(clientId, params);
        }
    });
}
