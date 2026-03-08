import type { DirectionType } from "@keycloak/keycloak-admin-client/lib/resources/userStorageProvider";
import { useMutation } from "@tanstack/react-query";
import { useAdminClient } from "../../../app/admin-client";
import { syncMappers } from "../../../api/user-federation";

export function useSyncMappers() {
    const { adminClient } = useAdminClient();
    return useMutation({
        mutationFn: ({
            parentId,
            id,
            direction
        }: {
            parentId: string;
            id: string;
            direction: DirectionType;
        }) => syncMappers(adminClient, parentId, id, direction)
    });
}
