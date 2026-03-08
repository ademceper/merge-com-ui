import { useMutation, useQueryClient } from "@tanstack/react-query";
import { removeOrgMember, addOrgMember, inviteExistingUser } from "../../../api/users";
import { userKeys } from "./keys";

export function useRemoveOrgMember(userId: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (orgIds: string[]) =>
            Promise.all(orgIds.map(orgId => removeOrgMember(orgId, userId))),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: userKeys.organizations(userId) });
        }
    });
}

export function useAddOrgMember(userId: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (orgIds: string[]) =>
            Promise.all(orgIds.map(orgId => addOrgMember(orgId, `"${userId}"`))),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: userKeys.organizations(userId) });
        }
    });
}

export function useInviteToOrg(userId: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ orgId, formData }: { orgId: string; formData: FormData }) =>
            inviteExistingUser(orgId, formData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: userKeys.organizations(userId) });
        }
    });
}
