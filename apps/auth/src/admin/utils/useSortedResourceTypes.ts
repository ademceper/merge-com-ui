/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/utils/useSortedResourceTypes.ts"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import ResourceServerRepresentation from "@keycloak/keycloak-admin-client/lib/defs/resourceServerRepresentation";
import { useMemo, useState } from "react";
import { useAdminClient } from "../admin-client";
import { useFetch } from "../../shared/keycloak-ui-shared";
import { sortBy } from "lodash-es";

type UseSortedResourceTypesProps = {
    clientId: string;
};

export default function useSortedResourceTypes({
    clientId
}: UseSortedResourceTypesProps) {
    const { adminClient } = useAdminClient();
    const [resourceServer, setResourceServer] = useState<ResourceServerRepresentation>();

    useFetch(
        () =>
            adminClient.clients.getResourceServer({
                id: clientId
            }),
        setResourceServer,
        [clientId]
    );

    const resourceTypes = useMemo(() => {
        const allResourceTypes = resourceServer?.authorizationSchema?.resourceTypes;
        return allResourceTypes ? sortBy(Object.values(allResourceTypes), "type") : [];
    }, [resourceServer]);

    return resourceTypes;
}
