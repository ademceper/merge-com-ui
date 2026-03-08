import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAdminClient } from "../../../app/admin-client";
import { removeOrganizationMember } from "../../../api/organizations";
import { organizationKeys } from "./keys";

export function useRemoveOrganizationMembers(orgId: string) {
    const { adminClient } = useAdminClient();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (userIds: string[]) =>
            removeOrganizationMember(adminClient, orgId, userIds),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: organizationKeys.members(orgId)
            });
        }
    });
}
