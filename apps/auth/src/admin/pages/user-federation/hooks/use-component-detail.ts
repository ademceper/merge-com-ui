import { useQuery } from "@tanstack/react-query";
import { findComponentDetail } from "@/admin/api/user-federation";
import { federationKeys } from "./keys";

export function useComponentDetail(id: string | undefined) {
    return useQuery({
        queryKey: federationKeys.detail(id ?? ""),
        queryFn: () => findComponentDetail(id!),
        enabled: !!id
    });
}
