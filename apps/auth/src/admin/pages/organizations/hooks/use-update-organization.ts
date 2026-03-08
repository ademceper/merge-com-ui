import type OrganizationRepresentation from "@keycloak/keycloak-admin-client/lib/defs/organizationRepresentation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateOrganization } from "../../../api/organizations";
import { organizationKeys } from "./keys";

export function useUpdateOrganization(id: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (org: OrganizationRepresentation) =>
            updateOrganization(id, org),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: organizationKeys.detail(id) });
            queryClient.invalidateQueries({ queryKey: organizationKeys.lists() });
        }
    });
}
