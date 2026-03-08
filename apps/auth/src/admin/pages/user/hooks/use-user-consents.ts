import { useQuery } from "@tanstack/react-query";
import { sortBy } from "lodash-es";
import { fetchUserConsents } from "../../../api/users";
import { userKeys } from "./keys";

export function useUserConsents(id: string) {
    return useQuery({
        queryKey: userKeys.consents(id),
        queryFn: async () =>
            sortBy(await fetchUserConsents(id), client =>
                client.clientId?.toUpperCase()
            ),
        enabled: !!id
    });
}
