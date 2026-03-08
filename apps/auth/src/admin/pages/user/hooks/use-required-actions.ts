import type RequiredActionProviderRepresentation from "@keycloak/keycloak-admin-client/lib/defs/requiredActionProviderRepresentation";
import { useQuery } from "@tanstack/react-query";
import { fetchRequiredActions } from "../../../api/users";
import { userKeys } from "./keys";

export function useRequiredActions() {
    return useQuery<RequiredActionProviderRepresentation[]>({
        queryKey: userKeys.requiredActions(),
        queryFn: async () => {
            const actions = await fetchRequiredActions();
            return actions.filter(action => action.enabled);
        }
    });
}
