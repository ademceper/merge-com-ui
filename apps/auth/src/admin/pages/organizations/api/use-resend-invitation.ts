import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAdminClient } from "../../../app/admin-client";
import { resendInvitation } from "../../../api/organizations";
import { organizationKeys } from "./keys";

export function useResendInvitation(orgId: string) {
    const { adminClient } = useAdminClient();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (invitationId: string) =>
            resendInvitation(adminClient, orgId, invitationId),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: organizationKeys.invitations(orgId)
            });
        }
    });
}
