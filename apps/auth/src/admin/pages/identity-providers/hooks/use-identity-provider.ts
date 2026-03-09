import { useQuery } from "@tanstack/react-query";
import { findIdentityProvider } from "@/admin/api/identity-providers";
import { idpKeys } from "./keys";

export function useIdentityProvider(alias: string) {
    return useQuery({
        queryKey: idpKeys.detail(alias),
        queryFn: () => findIdentityProvider(alias),
        enabled: !!alias
    });
}
