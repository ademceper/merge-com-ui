import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { findClients } from "@/admin/api/clients";
import { clientKeys } from "./keys";

export const clientsQueryOptions = () =>
    queryOptions({
        queryKey: clientKeys.lists(),
        queryFn: () => findClients()
    });

export function useClients() {
    return useSuspenseQuery(clientsQueryOptions());
}
