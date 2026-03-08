import { useQuery } from "@tanstack/react-query";
import { useAdminClient } from "../../../app/admin-client";
import { fetchFormProviders } from "../../../api/authentication";
import { authenticationKeys } from "./keys";

export function useFormProviders() {
    const { adminClient } = useAdminClient();
    return useQuery({
        queryKey: authenticationKeys.formProviders(),
        queryFn: () => fetchFormProviders(adminClient)
    });
}
