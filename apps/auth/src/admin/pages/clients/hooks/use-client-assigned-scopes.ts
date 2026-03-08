import { useQuery } from "@tanstack/react-query";
import {
    fetchClientScopes,
    fetchDefaultClientScopes,
    fetchOptionalClientScopes
} from "../../../api/clients";
import { useAdminClient } from "../../../app/admin-client";
import { clientKeys } from "./keys";

export function useClientAssignedScopes(clientId: string) {
    const { adminClient } = useAdminClient();
    return useQuery({
        queryKey: clientKeys.clientScopes(clientId),
        queryFn: async () => {
            const [defaultClientScopes, optionalClientScopes, clientScopes] =
                await Promise.all([
                    fetchDefaultClientScopes(adminClient, clientId),
                    fetchOptionalClientScopes(adminClient, clientId),
                    fetchClientScopes(adminClient)
                ]);
            return { defaultClientScopes, optionalClientScopes, clientScopes };
        }
    });
}
