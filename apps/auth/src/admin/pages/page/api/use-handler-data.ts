import { useQuery } from "@tanstack/react-query";
import { findHandlerData } from "../../../api/page-components";
import { useAdminClient } from "../../../app/admin-client";
import { pageKeys } from "./keys";

export function useHandlerData(
    id: string | undefined,
    providerType: string,
    providerId: string | undefined
) {
    const { adminClient } = useAdminClient();
    return useQuery({
        queryKey: pageKeys.handlerData(id, providerType),
        queryFn: () => findHandlerData(adminClient, id, providerType, providerId)
    });
}
