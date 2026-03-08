import { useQuery } from "@tanstack/react-query";
import { fetchUserProfileGlobal } from "../../../api/realm-settings";
import { realmSettingsKeys } from "./keys";

/** User profile without realm param (global) */
export function useUserProfileConfigGlobal() {
    return useQuery({
        queryKey: realmSettingsKeys.userProfileGlobal(),
        queryFn: () => fetchUserProfileGlobal()
    });
}
