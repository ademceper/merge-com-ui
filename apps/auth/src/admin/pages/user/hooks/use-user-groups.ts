import type GroupRepresentation from "@keycloak/keycloak-admin-client/lib/defs/groupRepresentation";
import { useQuery } from "@tanstack/react-query";
import { sortBy } from "lodash-es";
import { fetchUserGroups } from "../../../api/users";
import { userKeys } from "./keys";

export function useUserGroups(userId: string, isDirectMembership: boolean) {
    return useQuery({
        queryKey: userKeys.groups(userId, { isDirectMembership }),
        queryFn: async () => {
            const joinedUserGroups = await fetchUserGroups(
                userId,
                0,
                500
            );

            const indirect: GroupRepresentation[] = [];
            if (!isDirectMembership) {
                joinedUserGroups.forEach(g => {
                    const paths = (
                        g.path?.substring(1).match(/((~\/)|[^/])+/g) || []
                    ).slice(0, -1);
                    indirect.push(
                        ...paths.map(
                            p =>
                                ({
                                    name: p,
                                    path: g.path?.substring(
                                        0,
                                        g.path!.indexOf(p) + p.length
                                    )
                                }) as GroupRepresentation
                        )
                    );
                });
            }

            const { uniqBy } = await import("lodash-es");
            const alphabetize = (groupsList: GroupRepresentation[]) =>
                sortBy(groupsList, group => group.path?.toUpperCase());

            return {
                groups: alphabetize(uniqBy([...joinedUserGroups, ...indirect], "path")),
                directMembershipList: [...joinedUserGroups]
            };
        },
        enabled: !!userId
    });
}
