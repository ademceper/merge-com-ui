import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAdminClient } from "../../../app/admin-client";
import { unlinkOrganizationIdp } from "../../../api/organizations";
import { organizationKeys } from "./keys";

export function useUnlinkIdentityProvider(orgId: string) {
    const { adminClient } = useAdminClient();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (alias: string) =>
            unlinkOrganizationIdp(adminClient, orgId, alias),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: organizationKeys.identityProviders(orgId)
            });
        }
    });
}
