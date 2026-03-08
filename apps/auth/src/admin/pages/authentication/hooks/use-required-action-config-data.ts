import { useQuery } from "@tanstack/react-query";
import { useAdminClient } from "../../../app/admin-client";
import { fetchRequiredActionConfigData } from "../../../api/authentication";
import { authenticationKeys } from "./keys";

export function useRequiredActionConfigData(alias: string) {
    const { adminClient } = useAdminClient();
    return useQuery({
        queryKey: authenticationKeys.requiredActionConfig(alias),
        queryFn: () => fetchRequiredActionConfigData(adminClient, alias)
    });
}
