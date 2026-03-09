import { useMutation } from "@tanstack/react-query";
import { impersonateUser } from "@/admin/api/users";

export function useImpersonateUser() {
    return useMutation({
        mutationFn: ({ id, realm }: { id: string; realm: string }) =>
            impersonateUser(id, realm)
    });
}
