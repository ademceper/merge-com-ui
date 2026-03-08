import { useQuery } from "@tanstack/react-query";
import { findOnePolicy, getResource } from "../../../../api/client-authorization";
import { type Type, authzKeys } from "./keys";

export function useSelectedItems(clientId: string, name: Type, value: string[]) {
    return useQuery({
        queryKey: authzKeys.selectedItems(clientId, name, value),
        queryFn: async () => {
            if (name === "resources")
                return await Promise.all(
                    (value || []).map(id =>
                        getResource(clientId, id)
                    )
                );
            return await Promise.all(
                (value || []).map(async id =>
                    findOnePolicy(clientId, id)
                )
            );
        },
        enabled: (value || []).length > 0
    });
}
