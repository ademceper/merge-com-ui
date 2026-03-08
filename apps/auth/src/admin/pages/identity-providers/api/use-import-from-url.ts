import { useMutation } from "@tanstack/react-query";
import { useAdminClient } from "../../../app/admin-client";
import { importFromUrl } from "../../../api/identity-providers";

export function useImportFromUrl() {
    const { adminClient } = useAdminClient();
    return useMutation({
        mutationFn: (params: { providerId: string; fromUrl: string }) =>
            importFromUrl(adminClient, params)
    });
}
