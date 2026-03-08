import { useQuery } from "@tanstack/react-query";
import { findOnePolicy, getResource } from "../../../../api/client-authorization";
import { useAdminClient } from "../../../../app/admin-client";
import { type Type, authzKeys } from "./keys";

export function useSelectedItems(clientId: string, name: Type, value: string[]) {
    const { adminClient } = useAdminClient();
    return useQuery({
        queryKey: authzKeys.selectedItems(clientId, name, value),
        queryFn: async () => {
            if (name === "resources")
                return await Promise.all(
                    (value || []).map(id =>
                        getResource(adminClient, clientId, id)
                    )
                );
            return await Promise.all(
                (value || []).map(async id =>
                    findOnePolicy(adminClient, clientId, id)
                )
            );
        },
        enabled: (value || []).length > 0
    });
}
