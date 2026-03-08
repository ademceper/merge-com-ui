import type OrganizationRepresentation from "@keycloak/keycloak-admin-client/lib/defs/organizationRepresentation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAdminClient } from "../../../app/admin-client";
import { updateOrganization } from "../../../api/organizations";
import { organizationKeys } from "./keys";

export function useUpdateOrganization(id: string) {
    const { adminClient } = useAdminClient();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (org: OrganizationRepresentation) =>
            updateOrganization(adminClient, id, org),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: organizationKeys.detail(id) });
            queryClient.invalidateQueries({ queryKey: organizationKeys.lists() });
        }
    });
}
