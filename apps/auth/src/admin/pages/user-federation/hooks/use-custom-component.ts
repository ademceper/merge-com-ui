import { useQuery } from "@tanstack/react-query";
import { findCustomComponent } from "@/admin/api/user-federation";
import { federationKeys } from "./keys";

export function useCustomComponent(id: string | undefined) {
    return useQuery({
        queryKey: federationKeys.customComponent(id ?? ""),
        queryFn: async () => {
            if (!id) return undefined;
            return findCustomComponent(id);
        },
        enabled: !!id
    });
}
