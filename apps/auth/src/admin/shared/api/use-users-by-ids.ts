import { useQuery } from "@tanstack/react-query";
import { findUsersByIds } from "../../api/shared";
import { useAdminClient } from "../../app/admin-client";
import { sharedKeys } from "./keys";

export function useUsersByIds(ids: string[] | undefined) {
    const { adminClient } = useAdminClient();
    return useQuery({
        queryKey: sharedKeys.users.byIds(ids),
        queryFn: () => findUsersByIds(adminClient, ids || []),
        enabled: !!ids && ids.length > 0
    });
}
