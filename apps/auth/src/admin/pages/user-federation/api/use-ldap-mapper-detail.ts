import { useQuery } from "@tanstack/react-query";
import { useAdminClient } from "../../../app/admin-client";
import { findLdapMapperDetail } from "../../../api/user-federation";
import { federationKeys } from "./keys";

export function useLdapMapperDetail(id: string, mapperId: string) {
    const { adminClient } = useAdminClient();
    return useQuery({
        queryKey: federationKeys.mapperDetail(id, mapperId),
        queryFn: () => findLdapMapperDetail(adminClient, id, mapperId),
        enabled: !!id
    });
}
