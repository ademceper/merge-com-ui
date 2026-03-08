import { useQuery } from "@tanstack/react-query";
import { fetchInitialAccessTokens } from "../../../api/clients";
import { useAdminClient } from "../../../app/admin-client";
import { useRealm } from "../../../app/providers/realm-context/realm-context";
import { clientKeys } from "./keys";

export function useInitialAccessTokens() {
    const { adminClient } = useAdminClient();
    const { realm } = useRealm();
    return useQuery({
        queryKey: clientKeys.initialAccessTokens(),
        queryFn: () => fetchInitialAccessTokens(adminClient, realm)
    });
}
