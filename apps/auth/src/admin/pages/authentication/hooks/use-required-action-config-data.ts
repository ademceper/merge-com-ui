import { useQuery } from "@tanstack/react-query";
import { fetchRequiredActionConfigData } from "@/admin/api/authentication";
import { authenticationKeys } from "./keys";

export function useRequiredActionConfigData(alias: string) {
    return useQuery({
        queryKey: authenticationKeys.requiredActionConfig(alias),
        queryFn: () => fetchRequiredActionConfigData(alias)
    });
}
