import { useMutation, useQueryClient } from "@tanstack/react-query";
import { resendInvitation } from "../../../api/organizations";
import { organizationKeys } from "./keys";

export function useResendInvitation(orgId: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (invitationId: string) =>
            resendInvitation(orgId, invitationId),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: organizationKeys.invitations(orgId)
            });
        }
    });
}
