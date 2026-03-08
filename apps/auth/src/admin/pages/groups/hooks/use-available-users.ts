import type UserRepresentation from "@keycloak/keycloak-admin-client/lib/defs/userRepresentation";
import { useQuery } from "@tanstack/react-query";
import { differenceBy } from "lodash-es";
import { findUsers } from "../../../api/groups";

/**
 * Fetch users available to add (not yet members).
 * Accepts an async function that returns current members.
 */
export function useAvailableUsers(
    queryKey: string,
    fetchMembers: () => Promise<UserRepresentation[]>,
    enabled = true
) {
    return useQuery({
        queryKey: ["availableUsers", queryKey],
        queryFn: async () => {
            const members = await fetchMembers();
            const found = await findUsers({ first: 0, max: 500, search: "" });
            return differenceBy(found, members, "id").slice(0, 100);
        },
        enabled
    });
}
