import { useQuery } from "@tanstack/react-query";
import { useRealm } from "@/admin/app/providers/realm-context/realm-context";
import { fetchKeyProviderComponents } from "@/admin/api/realm-settings";
import { realmSettingsKeys } from "./keys";

export function useKeyProviderComponents() {
    const { realm } = useRealm();
    return useQuery({
        queryKey: realmSettingsKeys.keyProviderComponents(realm),
        queryFn: () => fetchKeyProviderComponents(realm)
    });
}
