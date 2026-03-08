import type ComponentRepresentation from "@keycloak/keycloak-admin-client/lib/defs/componentRepresentation";
import { useQuery } from "@tanstack/react-query";
import { findPageComponent } from "../../../api/page-components";
import { useAdminClient } from "../../../app/admin-client";
import { pageKeys } from "./keys";

export function usePageComponent(id: string | undefined) {
    const { adminClient } = useAdminClient();
    return useQuery<ComponentRepresentation | undefined>({
        queryKey: pageKeys.detail(id!),
        queryFn: () => findPageComponent(adminClient, id!),
        enabled: !!id
    });
}
