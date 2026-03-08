import { useQuery } from "@tanstack/react-query";
import { useAdminClient } from "../../../app/admin-client";
import { findIdentityProviderMapper } from "../../../api/identity-providers";
import { idpKeys } from "./keys";

export function useIdentityProviderMapper(alias: string, id: string) {
    const { adminClient } = useAdminClient();
    return useQuery({
        queryKey: idpKeys.mapperDetail(alias, id),
        queryFn: () => findIdentityProviderMapper(adminClient, alias, id),
        enabled: !!alias && !!id
    });
}
