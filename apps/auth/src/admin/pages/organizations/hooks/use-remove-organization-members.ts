import { useMutation, useQueryClient } from "@tanstack/react-query";
import { removeOrganizationMember } from "../../../api/organizations";
import { organizationKeys } from "./keys";

export function useRemoveOrganizationMembers(orgId: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (userIds: string[]) =>
            removeOrganizationMember(orgId, userIds),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: organizationKeys.members(orgId)
            });
        }
    });
}
