import { useQuery } from "@tanstack/react-query";
import { useAdminClient } from "../../../app/admin-client";
import { fetchClientPolicies } from "../../../api/realm-settings";
import { realmSettingsKeys } from "./keys";

export function useClientPolicies() {
    const { adminClient } = useAdminClient();
    return useQuery({
        queryKey: realmSettingsKeys.clientPolicies(),
        queryFn: () => fetchClientPolicies(adminClient)
    });
}
