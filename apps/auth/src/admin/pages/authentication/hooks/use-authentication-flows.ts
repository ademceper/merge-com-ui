import { useQuery } from "@tanstack/react-query";
import { useAdminClient } from "../../../app/admin-client";
import { useRealm } from "../../../app/providers/realm-context/realm-context";
import { fetchAuthenticationFlows } from "../../../api/authentication";
import { authenticationKeys } from "./keys";

export function useAuthenticationFlows(enabled = true) {
    const { adminClient } = useAdminClient();
    const { realm: realmName } = useRealm();
    return useQuery({
        queryKey: authenticationKeys.flows(),
        queryFn: () => fetchAuthenticationFlows(adminClient, realmName),
        enabled
    });
}
