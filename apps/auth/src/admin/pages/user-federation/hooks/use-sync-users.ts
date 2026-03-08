import { useMutation } from "@tanstack/react-query";
import { syncUsers } from "../../../api/user-federation";

export function useSyncUsers() {
    return useMutation({
        mutationFn: ({
            id,
            action
        }: {
            id: string;
            action: "triggerChangedUsersSync" | "triggerFullSync";
        }) => syncUsers(id, action)
    });
}
