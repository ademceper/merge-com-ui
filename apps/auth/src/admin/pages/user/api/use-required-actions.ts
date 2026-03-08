import type RequiredActionProviderRepresentation from "@keycloak/keycloak-admin-client/lib/defs/requiredActionProviderRepresentation";
import { useQuery } from "@tanstack/react-query";
import { fetchRequiredActions } from "../../../api/users";
import { useAdminClient } from "../../../app/admin-client";
import { userKeys } from "./keys";

export function useRequiredActions() {
    const { adminClient } = useAdminClient();
    return useQuery<RequiredActionProviderRepresentation[]>({
        queryKey: userKeys.requiredActions(),
        queryFn: async () => {
            const actions = await fetchRequiredActions(adminClient);
            return actions.filter(action => action.enabled);
        }
    });
}
