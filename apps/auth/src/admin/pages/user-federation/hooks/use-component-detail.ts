import { useQuery } from "@tanstack/react-query";
import { useAdminClient } from "../../../app/admin-client";
import { findComponentDetail } from "../../../api/user-federation";
import { federationKeys } from "./keys";

export function useComponentDetail(id: string | undefined) {
    const { adminClient } = useAdminClient();
    return useQuery({
        queryKey: federationKeys.detail(id ?? ""),
        queryFn: () => findComponentDetail(adminClient, id!),
        enabled: !!id
    });
}
