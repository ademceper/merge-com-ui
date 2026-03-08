import { useQuery } from "@tanstack/react-query";
import { useAdminClient } from "../../../app/admin-client";
import { findOrgIdentityProviders } from "../../../api/identity-providers";
import { idpKeys } from "./keys";

export function useOrgIdentityProviders(orgId: string) {
    const { adminClient } = useAdminClient();
    return useQuery({
        queryKey: idpKeys.orgProviders(orgId),
        queryFn: () => findOrgIdentityProviders(adminClient, orgId),
        enabled: !!orgId
    });
}
