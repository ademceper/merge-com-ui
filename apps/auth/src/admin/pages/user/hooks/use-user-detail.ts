import type { UserProfileConfig } from "@keycloak/keycloak-admin-client/lib/defs/userProfileMetadata";
import { useQuery } from "@tanstack/react-query";
import {
    fetchAttackDetection,
    fetchOrganizations,
    fetchUserProfile,
    fetchUserUnmanagedAttributes,
    findUser
} from "../../../api/users";
import type { UIUserRepresentation } from "../form-state";
import { type UserDetailData, userKeys } from "./keys";

export function useUserDetail(
    id: string,
    realmName: string,
    realm: { bruteForceProtected?: boolean; organizationsEnabled?: boolean } | undefined,
    showOrganizations: boolean
) {
    return useQuery<UserDetailData>({
        queryKey: userKeys.detail(id),
        queryFn: async () => {
            const [
                userData,
                attackDetection,
                unmanagedAttributes,
                upConfig,
                organizations
            ] = await Promise.all([
                findUser(id, true) as Promise<
                    UIUserRepresentation | undefined
                >,
                fetchAttackDetection(id),
                fetchUserUnmanagedAttributes(id),
                fetchUserProfile(realmName),
                showOrganizations
                    ? fetchOrganizations(0, 1)
                    : Promise.resolve([])
            ]);

            if (!userData || !realm || !attackDetection) {
                throw new Error("User not found");
            }

            const { userProfileMetadata, ...user } = userData;
            user.unmanagedAttributes = unmanagedAttributes;

            return {
                user,
                userProfileMetadata,
                bruteForced: {
                    isBruteForceProtected: realm.bruteForceProtected,
                    isLocked: realm.bruteForceProtected && attackDetection.disabled
                },
                isUnmanagedAttributesEnabled:
                    (upConfig as UserProfileConfig).unmanagedAttributePolicy !== undefined,
                upConfig: upConfig as UserProfileConfig,
                realmHasOrganizations: organizations.length === 1
            };
        },
        enabled: !!id && !!realm
    });
}
