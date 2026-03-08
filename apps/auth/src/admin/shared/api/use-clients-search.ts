import { useQuery } from "@tanstack/react-query";
import { searchClients } from "../../api/shared";
import { useAdminClient } from "../../app/admin-client";
import { sharedKeys } from "./keys";

export function useClientsSearch(search: string) {
    const { adminClient } = useAdminClient();
    return useQuery({
        queryKey: sharedKeys.clients.search(search),
        queryFn: () => searchClients(adminClient, search)
    });
}
