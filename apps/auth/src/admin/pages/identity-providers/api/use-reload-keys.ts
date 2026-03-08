import { useMutation } from "@tanstack/react-query";
import { useAdminClient } from "../../../app/admin-client";
import { reloadKeys } from "../../../api/identity-providers";

export function useReloadKeys() {
    const { adminClient } = useAdminClient();
    return useMutation({
        mutationFn: (alias: string) => reloadKeys(adminClient, alias)
    });
}
