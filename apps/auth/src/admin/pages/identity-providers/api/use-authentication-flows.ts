import { useQuery } from "@tanstack/react-query";
import { useAdminClient } from "../../../app/admin-client";
import { fetchBasicFlows } from "../../../api/identity-providers";
import { idpKeys } from "./keys";

export function useAuthenticationFlows() {
    const { adminClient } = useAdminClient();
    return useQuery({
        queryKey: idpKeys.flows(),
        queryFn: () => fetchBasicFlows(adminClient)
    });
}
