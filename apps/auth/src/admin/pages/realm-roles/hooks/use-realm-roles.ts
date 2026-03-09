import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { findRealmRoles } from "@/admin/api/realm-roles";
import { roleKeys } from "./keys";

export const realmRolesQueryOptions = () =>
    queryOptions({
        queryKey: roleKeys.lists(),
        queryFn: () => findRealmRoles()
    });

export function useRealmRoles() {
    return useSuspenseQuery(realmRolesQueryOptions());
}
