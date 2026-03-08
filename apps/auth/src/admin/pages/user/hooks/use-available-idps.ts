import { useQuery } from "@tanstack/react-query";
import { fetchAvailableIdPs } from "../../../api/users";
import { useAdminClient } from "../../../app/admin-client";
import { userKeys } from "./keys";

export function useAvailableIdPs() {
    const { adminClient } = useAdminClient();
    return useQuery({
        queryKey: userKeys.availableIdPs(),
        queryFn: () => fetchAvailableIdPs(adminClient)
    });
}
