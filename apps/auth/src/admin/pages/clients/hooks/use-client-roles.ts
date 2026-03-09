import { useMutation } from "@tanstack/react-query";
import { createClientRole, findClientRole, listClientRoles } from "@/admin/api/clients";

export function useListClientRoles() {
    return useMutation({
        mutationFn: (clientId: string) => listClientRoles(clientId)
    });
}

export function useCreateClientRole() {
    return useMutation({
        mutationFn: async ({ clientId, role }: { clientId: string; role: Record<string, unknown> }) => {
            await createClientRole(clientId, role);
            const created = await findClientRole(clientId, role.name as string);
            return created;
        }
    });
}
