import { useQuery } from "@tanstack/react-query";
import { findLdapMapperDetail } from "@/admin/api/user-federation";
import { federationKeys } from "./keys";

export function useLdapMapperDetail(id: string, mapperId: string) {
    return useQuery({
        queryKey: federationKeys.mapperDetail(id, mapperId),
        queryFn: () => findLdapMapperDetail(id, mapperId),
        enabled: !!id
    });
}
