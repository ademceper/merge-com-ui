import type ComponentRepresentation from "@keycloak/keycloak-admin-client/lib/defs/componentRepresentation";
import { useQuery } from "@tanstack/react-query";
import { findPageComponents } from "@/admin/api/page-components";
import { pageKeys } from "./keys";

export function usePageComponents(realmId: string | undefined) {
    return useQuery<ComponentRepresentation[]>({
        queryKey: pageKeys.list(realmId),
        queryFn: () => findPageComponents(realmId!),
        enabled: !!realmId
    });
}
