import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { findOrganizations } from "@/admin/api/organizations";
import { organizationKeys } from "./keys";

export const organizationsQueryOptions = () =>
    queryOptions({
        queryKey: organizationKeys.lists(),
        queryFn: () => findOrganizations()
    });

export function useOrganizations() {
    return useSuspenseQuery(organizationsQueryOptions());
}
