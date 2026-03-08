import { useQuery } from "@tanstack/react-query";
import { findAdminPermissionsClient } from "../../../api/permissions";
import { permissionsKeys } from "./keys";

export function useAdminPermissionsClient() {
    return useQuery({
        queryKey: permissionsKeys.adminPermissionsClient(),
        queryFn: () => findAdminPermissionsClient()
    });
}
