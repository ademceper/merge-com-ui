import { useQuery } from "@tanstack/react-query";
import { findRealmRoles } from "../../../api/realm-roles";
import { roleKeys } from "./keys";

export function useRealmRoles() {
    return useQuery({
        queryKey: roleKeys.lists(),
        queryFn: () => findRealmRoles()
    });
}
