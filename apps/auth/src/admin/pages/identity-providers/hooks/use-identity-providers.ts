import { useQuery } from "@tanstack/react-query";
import { useAdminClient } from "../../../app/admin-client";
import { findIdentityProviders } from "../../../api/identity-providers";
import { idpKeys } from "./keys";

export function useIdentityProviders(params?: {
    realmOnly?: boolean;
    enabled?: boolean;
}) {
    const { adminClient } = useAdminClient();
    return useQuery({
        queryKey: idpKeys.list({ realmOnly: params?.realmOnly }),
        queryFn: () =>
            findIdentityProviders(adminClient, {
                realmOnly: params?.realmOnly
            }),
        enabled: params?.enabled ?? true
    });
}
