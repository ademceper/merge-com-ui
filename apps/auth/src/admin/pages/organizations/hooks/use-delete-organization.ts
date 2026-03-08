import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteOrganization } from "../../../api/organizations";
import { organizationKeys } from "./keys";

export function useDeleteOrganization() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => deleteOrganization(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: organizationKeys.lists() });
        }
    });
}
