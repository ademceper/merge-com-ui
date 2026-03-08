import { useQuery } from "@tanstack/react-query";
import { findIdentityProviderMappers } from "../../../api/identity-providers";
import { idpKeys } from "./keys";

export function useIdentityProviderMappers(alias: string) {
    return useQuery({
        queryKey: idpKeys.mappers(alias),
        queryFn: () => findIdentityProviderMappers(alias),
        enabled: !!alias
    });
}
