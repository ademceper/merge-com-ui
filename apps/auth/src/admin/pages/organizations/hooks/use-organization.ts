import { useQuery } from "@tanstack/react-query";
import { findOrganization } from "@/admin/api/organizations";
import { organizationKeys } from "./keys";

export function useOrganization(id: string) {
    return useQuery({
        queryKey: organizationKeys.detail(id),
        queryFn: () => findOrganization(id)
    });
}
