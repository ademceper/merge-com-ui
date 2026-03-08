import { useQuery } from "@tanstack/react-query";
import { findRoles } from "../../../../api/client-authorization";
import { authzKeys } from "./keys";

export function useRoles() {
    return useQuery({
        queryKey: authzKeys.roles(),
        queryFn: () => findRoles()
    });
}
