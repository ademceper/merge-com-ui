import { useQuery } from "@tanstack/react-query";
import { findOrgIdentityProviders } from "../../../api/identity-providers";
import { idpKeys } from "./keys";

export function useOrgIdentityProviders(orgId: string) {
    return useQuery({
        queryKey: idpKeys.orgProviders(orgId),
        queryFn: () => findOrgIdentityProviders(orgId),
        enabled: !!orgId
    });
}
