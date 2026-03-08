import { useQuery } from "@tanstack/react-query";
import { findPolicyDetailsByType } from "../../../api/permissions";
import { useAdminClient } from "../../../app/admin-client";
import { permissionsKeys } from "./keys";

export function usePolicyDetailsByType(
    clientId: string,
    values: { id: string; type?: string }[] | undefined
) {
    const { adminClient } = useAdminClient();
    const ids = (values || []).map(v => v.id).sort();
    return useQuery({
        queryKey: permissionsKeys.policyDetails(clientId, ids),
        queryFn: () => findPolicyDetailsByType(adminClient, clientId, values || []),
        enabled: !!clientId && !!values && values.length > 0
    });
}
