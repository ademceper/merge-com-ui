import { useQuery } from "@tanstack/react-query";
import { findGroupPicker } from "../../api/shared";
import { sharedKeys } from "./keys";

export function useGroupPicker(
    groupId: string | undefined,
    filter: string,
    first: number,
    max: number,
    userId?: string
) {
    return useQuery({
        queryKey: sharedKeys.groups.picker(groupId, filter, first, max),
        queryFn: () => findGroupPicker(groupId, filter, first, max, userId)
    });
}
