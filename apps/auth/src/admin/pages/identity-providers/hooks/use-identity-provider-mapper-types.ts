import { useQuery } from "@tanstack/react-query";
import { useAdminClient } from "../../../app/admin-client";
import { findIdentityProviderMapperTypes } from "../../../api/identity-providers";
import { idpKeys } from "./keys";

export function useIdentityProviderMapperTypes(alias: string) {
    const { adminClient } = useAdminClient();
    return useQuery({
        queryKey: idpKeys.mapperTypes(alias),
        queryFn: () => findIdentityProviderMapperTypes(adminClient, alias),
        enabled: !!alias
    });
}
