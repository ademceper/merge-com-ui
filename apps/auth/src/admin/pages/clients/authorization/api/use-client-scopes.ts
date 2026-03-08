import { useQuery } from "@tanstack/react-query";
import { findClientScopes } from "../../../../api/client-authorization";
import { useAdminClient } from "../../../../app/admin-client";
import { authzKeys } from "./keys";

export function useClientScopes() {
    const { adminClient } = useAdminClient();
    return useQuery({
        queryKey: authzKeys.clientScopes(),
        queryFn: () => findClientScopes(adminClient)
    });
}
