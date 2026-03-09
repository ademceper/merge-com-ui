import { useQuery } from "@tanstack/react-query";
import { fetchBasicFlows } from "@/admin/api/identity-providers";
import { idpKeys } from "./keys";

export function useAuthenticationFlows() {
    return useQuery({
        queryKey: idpKeys.flows(),
        queryFn: () => fetchBasicFlows()
    });
}
