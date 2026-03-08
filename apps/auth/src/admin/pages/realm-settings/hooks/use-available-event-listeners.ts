import { useQuery } from "@tanstack/react-query";
import { fetchAvailableEventListeners } from "../../../api/realm-settings";
import { realmSettingsKeys } from "./keys";

export function useAvailableEventListeners() {
    return useQuery({
        queryKey: realmSettingsKeys.eventListeners(),
        queryFn: () => fetchAvailableEventListeners()
    });
}
