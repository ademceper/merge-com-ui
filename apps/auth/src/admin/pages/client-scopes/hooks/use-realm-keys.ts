import { useQuery } from "@tanstack/react-query";
import { fetchRealmKeys } from "../../../api/client-scopes";
import { clientScopeKeys } from "./keys";

export function useRealmKeys(realm: string) {
    return useQuery({
        queryKey: clientScopeKeys.realmKeys(),
        queryFn: () => fetchRealmKeys(realm)
    });
}
