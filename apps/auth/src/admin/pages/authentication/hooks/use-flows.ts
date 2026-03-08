import { useQuery } from "@tanstack/react-query";
import { fetchAuthenticationFlows } from "../../../api/authentication";
import { useRealm } from "../../../app/providers/realm-context/realm-context";
import type { AuthenticationType } from "../constants";

export const useFlows = (enabled = true) => {
    const { realm } = useRealm();

    return useQuery({
        queryKey: ["authentication", realm, "flows"],
        queryFn: (): Promise<AuthenticationType[]> => fetchAuthenticationFlows(realm),
        enabled
    });
};
