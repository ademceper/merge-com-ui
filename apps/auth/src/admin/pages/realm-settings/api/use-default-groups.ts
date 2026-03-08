import { useQuery } from "@tanstack/react-query";
import { useAdminClient } from "../../../app/admin-client";
import { useRealm } from "../../../app/providers/realm-context/realm-context";
import { fetchDefaultGroups } from "../../../api/realm-settings";
import { realmSettingsKeys } from "./keys";

export function useDefaultGroups() {
    const { adminClient } = useAdminClient();
    const { realm } = useRealm();
    return useQuery({
        queryKey: realmSettingsKeys.defaultGroups(realm),
        queryFn: () => fetchDefaultGroups(adminClient, realm)
    });
}
