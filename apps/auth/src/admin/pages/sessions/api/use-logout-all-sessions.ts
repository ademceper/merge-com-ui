import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAdminClient } from "../../../app/admin-client";
import { useRealm } from "../../../app/providers/realm-context/realm-context";
import { logoutAllSessions } from "../../../api/sessions";
import { sessionKeys } from "./keys";

export function useLogoutAllSessions() {
    const { adminClient } = useAdminClient();
    const { realm } = useRealm();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: () => logoutAllSessions(adminClient, realm),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: sessionKeys.all
            });
        }
    });
}
