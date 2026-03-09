import type OrganizationRepresentation from "@keycloak/keycloak-admin-client/lib/defs/organizationRepresentation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createOrganization } from "@/admin/api/organizations";
import { organizationKeys } from "./keys";

export function useCreateOrganization() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (org: OrganizationRepresentation) =>
            createOrganization(org),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: organizationKeys.lists() });
        }
    });
}
