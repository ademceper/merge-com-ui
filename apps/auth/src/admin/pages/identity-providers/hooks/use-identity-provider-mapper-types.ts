import { useQuery } from "@tanstack/react-query";
import { findIdentityProviderMapperTypes } from "@/admin/api/identity-providers";
import { idpKeys } from "./keys";

export function useIdentityProviderMapperTypes(alias: string) {
    return useQuery({
        queryKey: idpKeys.mapperTypes(alias),
        queryFn: () => findIdentityProviderMapperTypes(alias),
        enabled: !!alias
    });
}
