import { useQuery } from "@tanstack/react-query";
import { findGroupPicker } from "../../api/shared";
import { useAdminClient } from "../../app/admin-client";
import { sharedKeys } from "./keys";

export function useGroupPicker(
    groupId: string | undefined,
    filter: string,
    first: number,
    max: number,
    userId?: string
) {
    const { adminClient } = useAdminClient();
    return useQuery({
        queryKey: sharedKeys.groups.picker(groupId, filter, first, max),
        queryFn: () => findGroupPicker(adminClient, groupId, filter, first, max, userId)
    });
}
