import { useQuery } from "@tanstack/react-query";
import { useAdminClient } from "../../../app/admin-client";
import { findIdentityProviderMappers } from "../../../api/identity-providers";
import { idpKeys } from "./keys";

export function useIdentityProviderMappers(alias: string) {
    const { adminClient } = useAdminClient();
    return useQuery({
        queryKey: idpKeys.mappers(alias),
        queryFn: () => findIdentityProviderMappers(adminClient, alias),
        enabled: !!alias
    });
}
