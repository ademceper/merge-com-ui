import { useQuery } from "@tanstack/react-query";
import { findComponent } from "../../../api/realm-settings";
import { realmSettingsKeys } from "./keys";

export function useComponent(id?: string) {
    return useQuery({
        queryKey: realmSettingsKeys.component(id!),
        queryFn: () => findComponent(id!),
        enabled: !!id
    });
}
