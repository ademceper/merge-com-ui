import { useMutation, useQueryClient } from "@tanstack/react-query";
import { togglePermissionEnabled } from "../../api/shared";
import type { PermissionScreenType } from "./keys";
import { sharedKeys } from "./keys";

export function useTogglePermission(
    id: string | undefined,
    type: PermissionScreenType,
    realm: string
) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ enabled }: { enabled: boolean }) => {
            return togglePermissionEnabled(id, type, realm, enabled);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: sharedKeys.permissions.detail(id, type, realm)
            });
        }
    });
}
