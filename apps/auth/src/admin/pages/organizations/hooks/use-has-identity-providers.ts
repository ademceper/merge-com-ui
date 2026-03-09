import { useQuery } from "@tanstack/react-query";
import { hasIdentityProviders } from "@/admin/api/organizations";
import { organizationKeys } from "./keys";

export function useHasIdentityProviders() {
    return useQuery({
        queryKey: organizationKeys.hasProviders(),
        queryFn: () => hasIdentityProviders()
    });
}
