import { useQuery } from "@tanstack/react-query";
import { fetchUserProfile } from "@/admin/api/shared";
import { sharedKeys } from "./keys";

export function useUserProfile() {
    return useQuery({
        queryKey: sharedKeys.users.profile(),
        queryFn: () => fetchUserProfile()
    });
}
