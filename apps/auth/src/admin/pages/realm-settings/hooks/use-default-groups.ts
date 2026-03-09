import { useQuery } from "@tanstack/react-query";
import { useRealm } from "@/admin/app/providers/realm-context/realm-context";
import { fetchDefaultGroups } from "@/admin/api/realm-settings";
import { realmSettingsKeys } from "./keys";

export function useDefaultGroups() {
    const { realm } = useRealm();
    return useQuery({
        queryKey: realmSettingsKeys.defaultGroups(realm),
        queryFn: () => fetchDefaultGroups(realm)
    });
}
