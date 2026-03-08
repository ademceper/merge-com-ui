import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRealm } from "../../../app/providers/realm-context/realm-context";
import { deleteSession } from "../../../api/sessions";
import { sessionKeys } from "./keys";

export function useDeleteSession() {
    const { realm } = useRealm();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ sessionId, isOffline }: { sessionId: string; isOffline: boolean }) =>
            deleteSession(realm, sessionId, isOffline),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: sessionKeys.all
            });
        }
    });
}
