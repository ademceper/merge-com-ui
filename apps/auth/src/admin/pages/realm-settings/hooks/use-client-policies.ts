import { useQuery } from "@tanstack/react-query";
import { fetchClientPolicies } from "@/admin/api/realm-settings";
import { realmSettingsKeys } from "./keys";

export function useClientPolicies() {
    return useQuery({
        queryKey: realmSettingsKeys.clientPolicies(),
        queryFn: () => fetchClientPolicies()
    });
}
