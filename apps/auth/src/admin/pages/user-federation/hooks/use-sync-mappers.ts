import type { DirectionType } from "@keycloak/keycloak-admin-client/lib/resources/userStorageProvider";
import { useMutation } from "@tanstack/react-query";
import { syncMappers } from "../../../api/user-federation";

export function useSyncMappers() {
    return useMutation({
        mutationFn: ({
            parentId,
            id,
            direction
        }: {
            parentId: string;
            id: string;
            direction: DirectionType;
        }) => syncMappers(parentId, id, direction)
    });
}
