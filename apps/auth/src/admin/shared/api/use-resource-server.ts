import { useQuery } from "@tanstack/react-query";
import { fetchResourceServer } from "../../api/shared";
import { sharedKeys } from "./keys";

export function useResourceServer(clientId: string) {
    return useQuery({
        queryKey: sharedKeys.resourceServer.byClient(clientId),
        queryFn: () => fetchResourceServer(clientId)
    });
}
