import { useQuery } from "@tanstack/react-query";
import { findCurrentUser } from "../../api/shared";
import { useAdminClient } from "../../app/admin-client";
import { useWhoAmI } from "../../app/providers/whoami/who-am-i";
import { sharedKeys } from "./keys";

export function useCurrentUser() {
    const { adminClient } = useAdminClient();
    const { whoAmI } = useWhoAmI();
    return useQuery({
        queryKey: sharedKeys.users.current(whoAmI.userId),
        queryFn: () => findCurrentUser(adminClient, whoAmI.userId),
        select: data => (data ? { ...data, realm: whoAmI.realm } : undefined)
    });
}
