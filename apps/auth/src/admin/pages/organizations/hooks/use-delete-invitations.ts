import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteInvitation } from "../../../api/organizations";
import { organizationKeys } from "./keys";

export function useDeleteInvitations(orgId: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (invitationIds: string[]) =>
            deleteInvitation(orgId, invitationIds),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: organizationKeys.invitations(orgId)
            });
        }
    });
}
