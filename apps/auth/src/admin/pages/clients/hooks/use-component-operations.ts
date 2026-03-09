import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createComponent, updateComponent, deleteComponent } from "@/admin/api/clients";
import { useRealm } from "@/admin/app/providers/realm-context/realm-context";
import { clientKeys } from "./keys";

export function useCreateComponent() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (component: Record<string, unknown>) => createComponent(component),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: clientKeys.all });
        }
    });
}

export function useUpdateComponent() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, component }: { id: string; component: Record<string, unknown> }) =>
            updateComponent(id, component),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: clientKeys.all });
        }
    });
}

export function useDeleteComponent() {
    const { realm } = useRealm();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => deleteComponent(realm, id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: clientKeys.all });
        }
    });
}
