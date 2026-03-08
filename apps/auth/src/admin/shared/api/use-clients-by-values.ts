import type ClientRepresentation from "@keycloak/keycloak-admin-client/lib/defs/clientRepresentation";
import { useQuery } from "@tanstack/react-query";
import { findClientsByValues } from "../../api/shared";
import { useAdminClient } from "../../app/admin-client";
import { sharedKeys } from "./keys";

export function useClientsByValues(
    values: string[],
    clientKey: keyof ClientRepresentation
) {
    const { adminClient } = useAdminClient();
    return useQuery({
        queryKey: sharedKeys.clients.byValues(values, clientKey),
        queryFn: () => findClientsByValues(adminClient, values, clientKey),
        enabled: values.length > 0
    });
}
