import { useMutation } from "@tanstack/react-query";
import { regenerateAccessToken } from "../../../api/clients";

export function useRegenerateAccessToken() {
    return useMutation({
        mutationFn: (clientId: string) => regenerateAccessToken(clientId)
    });
}
