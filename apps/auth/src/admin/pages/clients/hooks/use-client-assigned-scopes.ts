import { useQuery } from "@tanstack/react-query";
import {
    fetchClientScopes,
    fetchDefaultClientScopes,
    fetchOptionalClientScopes
} from "../../../api/clients";
import { clientKeys } from "./keys";

export function useClientAssignedScopes(clientId: string) {
    return useQuery({
        queryKey: clientKeys.clientScopes(clientId),
        queryFn: async () => {
            const [defaultClientScopes, optionalClientScopes, clientScopes] =
                await Promise.all([
                    fetchDefaultClientScopes(clientId),
                    fetchOptionalClientScopes(clientId),
                    fetchClientScopes()
                ]);
            return { defaultClientScopes, optionalClientScopes, clientScopes };
        }
    });
}
