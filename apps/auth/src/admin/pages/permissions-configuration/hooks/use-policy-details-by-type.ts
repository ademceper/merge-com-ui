import { useQuery } from "@tanstack/react-query";
import { findPolicyDetailsByType } from "@/admin/api/permissions";
import { permissionsKeys } from "./keys";

export function usePolicyDetailsByType(
    clientId: string,
    values: { id: string; type?: string }[] | undefined
) {
    const ids = (values || []).map(v => v.id).sort();
    return useQuery({
        queryKey: permissionsKeys.policyDetails(clientId, ids),
        queryFn: () => findPolicyDetailsByType(clientId, values || []),
        enabled: !!clientId && !!values && values.length > 0
    });
}
