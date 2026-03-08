import type ComponentRepresentation from "@keycloak/keycloak-admin-client/lib/defs/componentRepresentation";
import { useQuery } from "@tanstack/react-query";
import { findPageComponents } from "../../../api/page-components";
import { useAdminClient } from "../../../app/admin-client";
import { pageKeys } from "./keys";

export function usePageComponents(realmId: string | undefined) {
    const { adminClient } = useAdminClient();
    return useQuery<ComponentRepresentation[]>({
        queryKey: pageKeys.list(realmId),
        queryFn: () => findPageComponents(adminClient, realmId!),
        enabled: !!realmId
    });
}
