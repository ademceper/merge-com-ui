import { useQuery } from "@tanstack/react-query";
import { findClients } from "@/admin/api/clients";
import { clientKeys } from "./keys";

export function useClients() {
    return useQuery({
        queryKey: clientKeys.lists(),
        queryFn: () => findClients()
    });
}
