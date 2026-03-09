import { useQuery } from "@tanstack/react-query";
import { useRealm } from "@/admin/app/providers/realm-context/realm-context";
import { fetchAuthenticationFlows } from "@/admin/api/authentication";
import { authenticationKeys } from "./keys";

export function useAuthenticationFlows(enabled = true) {
    const { realm: realmName } = useRealm();
    return useQuery({
        queryKey: authenticationKeys.flows(),
        queryFn: () => fetchAuthenticationFlows(realmName),
        enabled
    });
}
