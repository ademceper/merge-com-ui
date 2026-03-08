import { useQuery } from "@tanstack/react-query";
import { searchClients } from "../../api/shared";
import { sharedKeys } from "./keys";

export function useClientsSearch(search: string) {
    return useQuery({
        queryKey: sharedKeys.clients.search(search),
        queryFn: () => searchClients(search),
        enabled: search.length > 0
    });
}
