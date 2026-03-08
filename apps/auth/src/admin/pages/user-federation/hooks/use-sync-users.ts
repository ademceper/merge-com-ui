import { useMutation } from "@tanstack/react-query";
import { useAdminClient } from "../../../app/admin-client";
import { syncUsers } from "../../../api/user-federation";

export function useSyncUsers() {
    const { adminClient } = useAdminClient();
    return useMutation({
        mutationFn: ({
            id,
            action
        }: {
            id: string;
            action: "triggerChangedUsersSync" | "triggerFullSync";
        }) => syncUsers(adminClient, id, action)
    });
}
