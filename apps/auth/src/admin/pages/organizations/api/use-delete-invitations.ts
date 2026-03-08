import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAdminClient } from "../../../app/admin-client";
import { deleteInvitation } from "../../../api/organizations";
import { organizationKeys } from "./keys";

export function useDeleteInvitations(orgId: string) {
    const { adminClient } = useAdminClient();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (invitationIds: string[]) =>
            deleteInvitation(adminClient, orgId, invitationIds),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: organizationKeys.invitations(orgId)
            });
        }
    });
}
