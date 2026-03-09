import { useQuery } from "@tanstack/react-query";
import { findRealmRole } from "@/admin/api/realm-roles";
import { roleKeys } from "./keys";

export function useRealmRole(id: string) {
    return useQuery({
        queryKey: roleKeys.detail(id),
        queryFn: () => findRealmRole(id)
    });
}
