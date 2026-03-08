import { useQuery } from "@tanstack/react-query";
import { useAdminClient } from "../../../app/admin-client";
import { findIdentityProvider } from "../../../api/identity-providers";
import { idpKeys } from "./keys";

export function useIdentityProvider(alias: string) {
    const { adminClient } = useAdminClient();
    return useQuery({
        queryKey: idpKeys.detail(alias),
        queryFn: () => findIdentityProvider(adminClient, alias),
        enabled: !!alias
    });
}
