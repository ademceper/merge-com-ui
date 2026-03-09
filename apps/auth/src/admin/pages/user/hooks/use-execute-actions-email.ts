import { useMutation } from "@tanstack/react-query";
import { executeActionsEmail } from "@/admin/api/users";

export function useExecuteActionsEmail() {
    return useMutation({
        mutationFn: ({
            userId,
            actions,
            lifespan
        }: {
            userId: string;
            actions: string[];
            lifespan?: number;
        }) => executeActionsEmail(userId, actions, lifespan)
    });
}
