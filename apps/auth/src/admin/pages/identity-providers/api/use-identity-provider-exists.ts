import { useQuery } from "@tanstack/react-query";
import { useAdminClient } from "../../../app/admin-client";
import { findIdentityProviderExists } from "../../../api/identity-providers";
import { idpKeys } from "./keys";

export function useIdentityProviderExists() {
    const { adminClient } = useAdminClient();
    return useQuery({
        queryKey: [...idpKeys.all, "exists"] as const,
        queryFn: () => findIdentityProviderExists(adminClient)
    });
}
