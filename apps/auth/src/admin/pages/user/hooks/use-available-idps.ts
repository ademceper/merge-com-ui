import { useQuery } from "@tanstack/react-query";
import { fetchAvailableIdPs } from "@/admin/api/users";
import { userKeys } from "./keys";

export function useAvailableIdPs() {
    return useQuery({
        queryKey: userKeys.availableIdPs(),
        queryFn: () => fetchAvailableIdPs()
    });
}
