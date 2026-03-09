import { useMutation } from "@tanstack/react-query";
import { unlinkUsers } from "@/admin/api/user-federation";

export function useUnlinkUsers() {
    return useMutation({
        mutationFn: (id: string) => unlinkUsers(id)
    });
}
