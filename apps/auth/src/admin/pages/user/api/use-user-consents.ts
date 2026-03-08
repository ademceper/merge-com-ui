import { useQuery } from "@tanstack/react-query";
import { sortBy } from "lodash-es";
import { fetchUserConsents } from "../../../api/users";
import { useAdminClient } from "../../../app/admin-client";
import { userKeys } from "./keys";

export function useUserConsents(id: string) {
    const { adminClient } = useAdminClient();
    return useQuery({
        queryKey: userKeys.consents(id),
        queryFn: async () =>
            sortBy(await fetchUserConsents(adminClient, id), client =>
                client.clientId?.toUpperCase()
            ),
        enabled: !!id
    });
}
