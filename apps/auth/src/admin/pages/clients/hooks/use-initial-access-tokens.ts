import { useQuery } from "@tanstack/react-query";
import { fetchInitialAccessTokens } from "@/admin/api/clients";
import { useRealm } from "@/admin/app/providers/realm-context/realm-context";
import { clientKeys } from "./keys";

export function useInitialAccessTokens() {
    const { realm } = useRealm();
    return useQuery({
        queryKey: clientKeys.initialAccessTokens(),
        queryFn: () => fetchInitialAccessTokens(realm)
    });
}
