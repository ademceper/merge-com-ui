import { useQuery } from "@tanstack/react-query";
import { useAdminClient } from "../../../app/admin-client";
import { findClientScopes } from "../../../api/realm-settings";
import { realmSettingsKeys } from "./keys";

export function useClientScopes() {
    const { adminClient } = useAdminClient();
    return useQuery({
        queryKey: realmSettingsKeys.clientScopes(),
        queryFn: () => findClientScopes(adminClient)
    });
}
