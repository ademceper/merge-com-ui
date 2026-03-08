import { useQuery } from "@tanstack/react-query";
import { useAdminClient } from "../../../app/admin-client";
import { findLdapMappers } from "../../../api/user-federation";
import { federationKeys } from "./keys";

export function useLdapMappers(parentId: string) {
    const { adminClient } = useAdminClient();
    return useQuery({
        queryKey: federationKeys.mappers(parentId),
        queryFn: () => findLdapMappers(adminClient, parentId),
        enabled: !!parentId
    });
}
