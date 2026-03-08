import { useQuery } from "@tanstack/react-query";
import { findClientScopes } from "../../../../api/client-authorization";
import { authzKeys } from "./keys";

export function useClientScopes() {
    return useQuery({
        queryKey: authzKeys.clientScopes(),
        queryFn: () => findClientScopes()
    });
}
