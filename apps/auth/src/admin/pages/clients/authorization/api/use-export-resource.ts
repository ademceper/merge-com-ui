import { useQuery } from "@tanstack/react-query";
import { exportResource } from "../../../../api/client-authorization";
import { useAdminClient } from "../../../../app/admin-client";
import { authzKeys } from "./keys";

export function useExportResource(clientId: string) {
    const { adminClient } = useAdminClient();
    return useQuery({
        queryKey: authzKeys.exportResource(clientId),
        queryFn: () => exportResource(adminClient, clientId)
    });
}
