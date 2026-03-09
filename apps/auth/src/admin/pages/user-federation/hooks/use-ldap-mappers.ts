import { useQuery } from "@tanstack/react-query";
import { findLdapMappers } from "@/admin/api/user-federation";
import { federationKeys } from "./keys";

export function useLdapMappers(parentId: string) {
    return useQuery({
        queryKey: federationKeys.mappers(parentId),
        queryFn: () => findLdapMappers(parentId),
        enabled: !!parentId
    });
}
