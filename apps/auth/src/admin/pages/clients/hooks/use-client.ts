import { useQuery } from "@tanstack/react-query";
import { findClient } from "../../../api/clients";
import { clientKeys } from "./keys";

export function useClient(clientId: string) {
    return useQuery({
        queryKey: clientKeys.detail(clientId),
        queryFn: () => findClient(clientId)
    });
}
