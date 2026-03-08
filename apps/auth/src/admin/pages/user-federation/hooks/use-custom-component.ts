import { useQuery } from "@tanstack/react-query";
import { useAdminClient } from "../../../app/admin-client";
import { findCustomComponent } from "../../../api/user-federation";
import { federationKeys } from "./keys";

export function useCustomComponent(id: string | undefined) {
    const { adminClient } = useAdminClient();
    return useQuery({
        queryKey: federationKeys.customComponent(id ?? ""),
        queryFn: async () => {
            if (!id) return undefined;
            return findCustomComponent(adminClient, id);
        },
        enabled: !!id
    });
}
