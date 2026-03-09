import { useMutation } from "@tanstack/react-query";
import { regenerateAccessToken } from "@/admin/api/clients";

export function useRegenerateAccessToken() {
    return useMutation({
        mutationFn: (clientId: string) => regenerateAccessToken(clientId)
    });
}
