import { useQuery } from "@tanstack/react-query";
import { useAdminClient } from "../../../app/admin-client";
import { fetchUserProfileGlobal } from "../../../api/realm-settings";
import { realmSettingsKeys } from "./keys";

/** User profile without realm param (global) */
export function useUserProfileConfigGlobal() {
    const { adminClient } = useAdminClient();
    return useQuery({
        queryKey: realmSettingsKeys.userProfileGlobal(),
        queryFn: () => fetchUserProfileGlobal(adminClient)
    });
}
