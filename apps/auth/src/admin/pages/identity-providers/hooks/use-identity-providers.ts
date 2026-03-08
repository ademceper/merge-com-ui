import { useQuery } from "@tanstack/react-query";
import { findIdentityProviders } from "../../../api/identity-providers";
import { idpKeys } from "./keys";

export function useIdentityProviders(params?: {
    realmOnly?: boolean;
    enabled?: boolean;
}) {
    return useQuery({
        queryKey: idpKeys.list({ realmOnly: params?.realmOnly }),
        queryFn: () =>
            findIdentityProviders({
                realmOnly: params?.realmOnly
            }),
        enabled: params?.enabled ?? true
    });
}
