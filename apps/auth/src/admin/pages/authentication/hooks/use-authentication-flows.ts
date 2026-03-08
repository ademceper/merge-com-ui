import { useQuery } from "@tanstack/react-query";
import { useRealm } from "../../../app/providers/realm-context/realm-context";
import { fetchAuthenticationFlows } from "../../../api/authentication";
import { authenticationKeys } from "./keys";

export function useAuthenticationFlows(enabled = true) {
    const { realm: realmName } = useRealm();
    return useQuery({
        queryKey: authenticationKeys.flows(),
        queryFn: () => fetchAuthenticationFlows(realmName),
        enabled
    });
}
