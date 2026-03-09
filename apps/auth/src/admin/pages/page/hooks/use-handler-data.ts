import { useQuery } from "@tanstack/react-query";
import { findHandlerData } from "@/admin/api/page-components";
import { pageKeys } from "./keys";

export function useHandlerData(
    id: string | undefined,
    providerType: string,
    providerId: string | undefined
) {
    return useQuery({
        queryKey: pageKeys.handlerData(id, providerType),
        queryFn: () => findHandlerData(id, providerType, providerId)
    });
}
