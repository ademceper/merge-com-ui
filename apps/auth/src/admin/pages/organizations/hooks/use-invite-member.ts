import { useMutation, useQueryClient } from "@tanstack/react-query";
import { inviteOrganizationMember } from "@/admin/api/organizations";
import { organizationKeys } from "./keys";

/**
 * Send an invitation to join an organization.
 */
export function useInviteMember(orgId: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (formData: FormData) =>
            inviteOrganizationMember(orgId, formData),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: organizationKeys.invitations(orgId)
            });
        }
    });
}
