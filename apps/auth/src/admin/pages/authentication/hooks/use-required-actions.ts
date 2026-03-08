import { useQuery } from "@tanstack/react-query";
import { useRealm } from "../../../app/providers/realm-context/realm-context";
import { fetchRequiredActions } from "../../../api/authentication";
import { authenticationKeys } from "./keys";

export function useRequiredActions() {
    const { realm: realmName } = useRealm();
    return useQuery({
        queryKey: authenticationKeys.requiredActions(),
        queryFn: () => fetchRequiredActions(realmName)
    });
}
