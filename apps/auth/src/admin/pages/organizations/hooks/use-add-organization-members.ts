import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAdminClient } from "../../../app/admin-client";
import { addOrganizationMember } from "../../../api/organizations";
import { organizationKeys } from "./keys";

export function useAddOrganizationMembers(orgId: string) {
    const { adminClient } = useAdminClient();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (userIds: string[]) =>
            addOrganizationMember(adminClient, orgId, userIds),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: organizationKeys.members(orgId)
            });
        }
    });
}
