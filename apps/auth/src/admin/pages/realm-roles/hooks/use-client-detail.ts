import { useQuery } from "@tanstack/react-query";
import { findClientDetail } from "@/admin/api/realm-roles";
import { roleKeys } from "./keys";

export function useClientDetail(clientId?: string) {
    return useQuery({
        queryKey: roleKeys.clientDetail(clientId!),
        queryFn: () => findClientDetail(clientId!),
        enabled: !!clientId
    });
}
