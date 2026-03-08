import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addOrganizationMember } from "../../../api/organizations";
import { organizationKeys } from "./keys";

export function useAddOrganizationMembers(orgId: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (userIds: string[]) =>
            addOrganizationMember(orgId, userIds),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: organizationKeys.members(orgId)
            });
        }
    });
}
