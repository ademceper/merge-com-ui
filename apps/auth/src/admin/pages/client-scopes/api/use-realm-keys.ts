import { useQuery } from "@tanstack/react-query";
import { fetchRealmKeys } from "../../../api/client-scopes";
import { useAdminClient } from "../../../app/admin-client";
import { clientScopeKeys } from "./keys";

export function useRealmKeys(realm: string) {
    const { adminClient } = useAdminClient();
    return useQuery({
        queryKey: clientScopeKeys.realmKeys(),
        queryFn: () => fetchRealmKeys(adminClient, realm)
    });
}
