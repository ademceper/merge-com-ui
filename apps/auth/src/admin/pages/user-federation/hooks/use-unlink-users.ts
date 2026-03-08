import { useMutation } from "@tanstack/react-query";
import { useAdminClient } from "../../../app/admin-client";
import { unlinkUsers } from "../../../api/user-federation";

export function useUnlinkUsers() {
    const { adminClient } = useAdminClient();
    return useMutation({
        mutationFn: (id: string) => unlinkUsers(adminClient, id)
    });
}
