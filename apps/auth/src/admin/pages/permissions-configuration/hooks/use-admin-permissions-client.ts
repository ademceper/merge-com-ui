import { useQuery } from "@tanstack/react-query";
import { findAdminPermissionsClient } from "../../../api/permissions";
import { useAdminClient } from "../../../app/admin-client";
import { permissionsKeys } from "./keys";

export function useAdminPermissionsClient() {
    const { adminClient } = useAdminClient();
    return useQuery({
        queryKey: permissionsKeys.adminPermissionsClient(),
        queryFn: () => findAdminPermissionsClient(adminClient)
    });
}
