import type UserRepresentation from "@keycloak/keycloak-admin-client/lib/defs/userRepresentation";
import { useQuery } from "@tanstack/react-query";
import {
    fetchMemberOrganizations,
    fetchOrganizationMembers
} from "../../../api/users";
import { useAdminClient } from "../../../app/admin-client";
import { userKeys } from "./keys";

export function useUserOrganizations(
    userId: string,
    username: string | undefined,
    filters?: { membershipTypes?: string[]; search?: string }
) {
    const { adminClient } = useAdminClient();
    return useQuery({
        queryKey: userKeys.organizations(userId, filters),
        queryFn: async () => {
            const userOrganizations = await fetchMemberOrganizations(
                adminClient,
                userId
            );

            const userOrganizationsWithMembershipTypes = await Promise.all(
                userOrganizations.map(async org => {
                    const memberships = await fetchOrganizationMembers(
                        adminClient,
                        org.id!
                    );

                    const userMemberships = memberships.filter(
                        (m: UserRepresentation) => m.username === username
                    );

                    const capitalizeFirst = (s: string | undefined) =>
                        s
                            ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()
                            : undefined;

                    const membershipType = userMemberships.map(
                        (m: UserRepresentation & { membershipType?: string }) =>
                            capitalizeFirst(m.membershipType)
                    );

                    return { ...org, membershipType };
                })
            );

            let filteredOrgs = userOrganizationsWithMembershipTypes;
            if (filters?.membershipTypes && filters.membershipTypes.length > 0) {
                filteredOrgs = filteredOrgs.filter(org =>
                    org.membershipType?.some(
                        (type: string | undefined) =>
                            type != null && filters.membershipTypes!.includes(type)
                    )
                );
            }

            if (filters?.search) {
                filteredOrgs = filteredOrgs.filter(org =>
                    org.name?.toLowerCase().includes(filters.search!.toLowerCase())
                );
            }

            return filteredOrgs;
        },
        enabled: !!userId
    });
}
