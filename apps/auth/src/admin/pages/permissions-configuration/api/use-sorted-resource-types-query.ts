import { sortBy } from "lodash-es";
import { useMemo } from "react";
import { useResourceServer } from "../../../shared/api/use-resource-server";

export function useSortedResourceTypesQuery(clientId: string) {
    const { data: resourceServer } = useResourceServer(clientId);

    return useMemo(() => {
        const allResourceTypes = resourceServer?.authorizationSchema?.resourceTypes;
        return allResourceTypes ? sortBy(Object.values(allResourceTypes), "type") : [];
    }, [resourceServer]);
}
