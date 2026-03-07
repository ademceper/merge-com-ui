import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type OrganizationRepresentation from "@keycloak/keycloak-admin-client/lib/defs/organizationRepresentation";
import type IdentityProviderRepresentation from "@keycloak/keycloak-admin-client/lib/defs/identityProviderRepresentation";
import type { OrganizationInvitationRepresentation } from "@keycloak/keycloak-admin-client";
import type UserRepresentation from "@keycloak/keycloak-admin-client/lib/defs/userRepresentation";
import { sortBy } from "lodash-es";
import { useAdminClient } from "../../../app/admin-client";

const organizationKeys = {
    all: ["organizations"] as const,
    lists: () => [...organizationKeys.all, "list"] as const,
    list: (filters?: Record<string, unknown>) =>
        [...organizationKeys.lists(), filters] as const,
    detail: (id: string) => [...organizationKeys.all, "detail", id] as const,
    members: (orgId: string, filters?: Record<string, unknown>) =>
        [...organizationKeys.all, "members", orgId, filters] as const,
    invitations: (orgId: string, filters?: Record<string, unknown>) =>
        [...organizationKeys.all, "invitations", orgId, filters] as const,
    identityProviders: (orgId: string) =>
        [...organizationKeys.all, "identityProviders", orgId] as const,
    hasProviders: () => [...organizationKeys.all, "hasProviders"] as const
};

export function useOrganizations() {
    const { adminClient } = useAdminClient();
    return useQuery({
        queryKey: organizationKeys.lists(),
        queryFn: () => adminClient.organizations.find({ first: 0, max: 1000 })
    });
}

export function useOrganization(id: string) {
    const { adminClient } = useAdminClient();
    return useQuery({
        queryKey: organizationKeys.detail(id),
        queryFn: () => adminClient.organizations.findOne({ id })
    });
}

export function useCreateOrganization() {
    const { adminClient } = useAdminClient();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (org: OrganizationRepresentation) =>
            adminClient.organizations.create(org),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: organizationKeys.lists() });
        }
    });
}

export function useUpdateOrganization(id: string) {
    const { adminClient } = useAdminClient();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (org: OrganizationRepresentation) =>
            adminClient.organizations.updateById({ id }, org),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: organizationKeys.detail(id) });
            queryClient.invalidateQueries({ queryKey: organizationKeys.lists() });
        }
    });
}

export function useDeleteOrganization() {
    const { adminClient } = useAdminClient();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => adminClient.organizations.delById({ id }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: organizationKeys.lists() });
        }
    });
}

export function useOrganizationMembers(
    orgId: string,
    filters?: { search?: string; membershipType?: string }
) {
    const { adminClient } = useAdminClient();
    return useQuery({
        queryKey: organizationKeys.members(orgId, filters),
        queryFn: async () => {
            return adminClient.organizations.listMembers({
                orgId,
                first: 0,
                max: 500,
                search: filters?.search,
                membershipType: filters?.membershipType
            });
        }
    });
}

export function useAddOrganizationMembers(orgId: string) {
    const { adminClient } = useAdminClient();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (userIds: string[]) =>
            Promise.all(
                userIds.map((userId) =>
                    adminClient.organizations.addMember({
                        orgId,
                        userId: `"${userId}"`
                    })
                )
            ),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: organizationKeys.members(orgId)
            });
        }
    });
}

export function useRemoveOrganizationMembers(orgId: string) {
    const { adminClient } = useAdminClient();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (userIds: string[]) =>
            Promise.all(
                userIds.map((userId) =>
                    adminClient.organizations.delMember({ orgId, userId })
                )
            ),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: organizationKeys.members(orgId)
            });
        }
    });
}

export function useOrganizationInvitations(
    orgId: string,
    filters?: { search?: string; status?: string }
) {
    const { adminClient } = useAdminClient();
    return useQuery({
        queryKey: organizationKeys.invitations(orgId, filters),
        queryFn: () =>
            adminClient.organizations.listInvitations({
                orgId,
                first: 0,
                max: 500,
                search: filters?.search,
                status: filters?.status
            })
    });
}

export function useResendInvitation(orgId: string) {
    const { adminClient } = useAdminClient();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (invitationId: string) =>
            adminClient.organizations.resendInvitation({ orgId, invitationId }),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: organizationKeys.invitations(orgId)
            });
        }
    });
}

export function useDeleteInvitations(orgId: string) {
    const { adminClient } = useAdminClient();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (invitationIds: string[]) =>
            Promise.all(
                invitationIds.map((invitationId) =>
                    adminClient.organizations.deleteInvitation({
                        orgId,
                        invitationId
                    })
                )
            ),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: organizationKeys.invitations(orgId)
            });
        }
    });
}

export function useOrganizationIdentityProviders(orgId: string) {
    const { adminClient } = useAdminClient();
    return useQuery({
        queryKey: organizationKeys.identityProviders(orgId),
        queryFn: async () =>
            sortBy(
                await adminClient.organizations.listIdentityProviders({ orgId }),
                "alias"
            )
    });
}

export function useUnlinkIdentityProvider(orgId: string) {
    const { adminClient } = useAdminClient();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (alias: string) =>
            adminClient.organizations.unLinkIdp({ orgId, alias }),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: organizationKeys.identityProviders(orgId)
            });
        }
    });
}

export function useHasIdentityProviders() {
    const { adminClient } = useAdminClient();
    return useQuery({
        queryKey: organizationKeys.hasProviders(),
        queryFn: async () => {
            const providers = await adminClient.identityProviders.find({ max: 1 });
            return providers.length === 1;
        }
    });
}

export function useUpdateIdentityProvider() {
    const { adminClient } = useAdminClient();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (provider: IdentityProviderRepresentation) =>
            adminClient.identityProviders.update(
                { alias: provider.alias! },
                provider
            ),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: organizationKeys.all
            });
        }
    });
}
