import { useQuery } from "@tanstack/react-query";
import { useAdminClient } from "../../../app/admin-client";
import { findComponent } from "../../../api/realm-settings";
import { realmSettingsKeys } from "./keys";

export function useComponent(id?: string) {
    const { adminClient } = useAdminClient();
    return useQuery({
        queryKey: realmSettingsKeys.component(id!),
        queryFn: () => findComponent(adminClient, id!),
        enabled: !!id
    });
}
