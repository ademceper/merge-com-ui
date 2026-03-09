import { useQuery } from "@tanstack/react-query";
import { findUsersByIds } from "@/admin/api/shared";
import { sharedKeys } from "./keys";

export function useUsersByIds(ids: string[] | undefined) {
    return useQuery({
        queryKey: sharedKeys.users.byIds(ids),
        queryFn: () => findUsersByIds(ids || []),
        enabled: !!ids && ids.length > 0
    });
}
