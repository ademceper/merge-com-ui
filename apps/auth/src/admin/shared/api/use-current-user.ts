import { useQuery } from "@tanstack/react-query";
import { findCurrentUser } from "@/admin/api/shared";
import { useWhoAmI } from "@/admin/app/providers/whoami/who-am-i";
import { sharedKeys } from "./keys";

export function useCurrentUser() {
    const { whoAmI } = useWhoAmI();
    return useQuery({
        queryKey: sharedKeys.users.current(whoAmI.userId),
        queryFn: () => findCurrentUser(whoAmI.userId),
        select: data => (data ? { ...data, realm: whoAmI.realm } : undefined)
    });
}
