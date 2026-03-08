import { useQuery } from "@tanstack/react-query";
import { fetchSamlKeyInfo } from "../../../api/clients";
import { clientKeys } from "./keys";

export function useSamlKeyInfo(clientId: string) {
    return useQuery({
        queryKey: clientKeys.samlKeys(clientId),
        queryFn: () => fetchSamlKeyInfo(clientId)
    });
}
