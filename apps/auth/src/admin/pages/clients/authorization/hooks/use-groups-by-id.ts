import { useQuery } from "@tanstack/react-query";
import { findGroupById } from "../../../../api/client-authorization";
import { useAdminClient } from "../../../../app/admin-client";
import { authzKeys } from "./keys";

export function useGroupsById(ids: string[]) {
    const { adminClient } = useAdminClient();
    return useQuery({
        queryKey: authzKeys.groups(ids),
        queryFn: () => {
            if (ids.length > 0)
                return Promise.all(ids.map(id => findGroupById(adminClient, id)));
            return Promise.resolve([]);
        },
        enabled: ids.length > 0
    });
}
