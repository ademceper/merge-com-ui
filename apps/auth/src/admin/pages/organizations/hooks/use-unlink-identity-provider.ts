import { useMutation, useQueryClient } from "@tanstack/react-query";
import { unlinkOrganizationIdp } from "../../../api/organizations";
import { organizationKeys } from "./keys";

export function useUnlinkIdentityProvider(orgId: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (alias: string) =>
            unlinkOrganizationIdp(orgId, alias),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: organizationKeys.identityProviders(orgId)
            });
        }
    });
}
