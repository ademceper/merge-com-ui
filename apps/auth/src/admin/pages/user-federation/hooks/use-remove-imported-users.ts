import { useMutation } from "@tanstack/react-query";
import { useAdminClient } from "../../../app/admin-client";
import { removeImportedUsers } from "../../../api/user-federation";

export function useRemoveImportedUsers() {
    const { adminClient } = useAdminClient();
    return useMutation({
        mutationFn: (id: string) => removeImportedUsers(adminClient, id)
    });
}
