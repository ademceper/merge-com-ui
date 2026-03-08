import { sortBy } from "lodash-es";
import { useMemo } from "react";
import { useResourceServer } from "../api/use-resource-server";

type UseSortedResourceTypesProps = {
    clientId: string;
};

export default function useSortedResourceTypes({
    clientId
}: UseSortedResourceTypesProps) {
    const { data: resourceServer } = useResourceServer(clientId);

    const resourceTypes = useMemo(() => {
        const allResourceTypes = resourceServer?.authorizationSchema?.resourceTypes;
        return allResourceTypes ? sortBy(Object.values(allResourceTypes), "type") : [];
    }, [resourceServer]);

    return resourceTypes;
}
