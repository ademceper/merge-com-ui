import type ClientRepresentation from "@keycloak/keycloak-admin-client/lib/defs/clientRepresentation";
import { useQuery } from "@tanstack/react-query";
import { findClientsByValues } from "@/admin/api/shared";
import { sharedKeys } from "./keys";

export function useClientsByValues(
    values: string[],
    clientKey: keyof ClientRepresentation
) {
    return useQuery({
        queryKey: sharedKeys.clients.byValues(values, clientKey),
        queryFn: () => findClientsByValues(values, clientKey),
        enabled: values.length > 0
    });
}
