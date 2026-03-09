import { useQuery } from "@tanstack/react-query";
import { findIdentityProviderExists } from "@/admin/api/identity-providers";
import { idpKeys } from "./keys";

export function useIdentityProviderExists() {
    return useQuery({
        queryKey: [...idpKeys.all, "exists"] as const,
        queryFn: () => findIdentityProviderExists()
    });
}
