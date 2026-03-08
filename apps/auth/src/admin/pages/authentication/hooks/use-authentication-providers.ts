import { useQuery } from "@tanstack/react-query";
import { useAdminClient } from "../../../app/admin-client";
import { fetchAuthenticationProviders } from "../../../api/authentication";
import { authenticationKeys } from "./keys";

export function useAuthenticationProviders() {
    const { adminClient } = useAdminClient();
    return useQuery({
        queryKey: authenticationKeys.providers(),
        queryFn: () => fetchAuthenticationProviders(adminClient)
    });
}
