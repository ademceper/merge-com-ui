import { useQuery } from "@tanstack/react-query";
import { sharedKeys } from "./keys";

export function useRolesList(
    loader: (
        first?: number,
        max?: number,
        search?: string
    ) => Promise<
        import("@keycloak/keycloak-admin-client/lib/defs/roleRepresentation").default[]
    >,
    parentRoleId: string | undefined
) {
    return useQuery({
        queryKey: sharedKeys.roles.list(parentRoleId),
        queryFn: () => loader(0, 500)
    });
}
