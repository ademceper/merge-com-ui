import { useQuery } from "@tanstack/react-query";
import { findIdentityProviderMapper } from "@/admin/api/identity-providers";
import { idpKeys } from "./keys";

export function useIdentityProviderMapper(alias: string, id: string) {
    return useQuery({
        queryKey: idpKeys.mapperDetail(alias, id),
        queryFn: () => findIdentityProviderMapper(alias, id),
        enabled: !!alias && !!id
    });
}
