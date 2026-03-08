import { useMutation } from "@tanstack/react-query";
import { regenerateAccessToken } from "../../../api/clients";
import { useAdminClient } from "../../../app/admin-client";

export function useRegenerateAccessToken() {
    const { adminClient } = useAdminClient();
    return useMutation({
        mutationFn: (clientId: string) => regenerateAccessToken(adminClient, clientId)
    });
}
