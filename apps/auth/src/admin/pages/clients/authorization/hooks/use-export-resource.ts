import { useQuery } from "@tanstack/react-query";
import { exportResource } from "../../../../api/client-authorization";
import { authzKeys } from "./keys";

export function useExportResource(clientId: string) {
    return useQuery({
        queryKey: authzKeys.exportResource(clientId),
        queryFn: () => exportResource(clientId)
    });
}
