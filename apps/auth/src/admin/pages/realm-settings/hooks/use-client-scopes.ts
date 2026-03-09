import { useQuery } from "@tanstack/react-query";
import { findClientScopes } from "@/admin/api/realm-settings";
import { realmSettingsKeys } from "./keys";

export function useClientScopes() {
    return useQuery({
        queryKey: realmSettingsKeys.clientScopes(),
        queryFn: () => findClientScopes()
    });
}
