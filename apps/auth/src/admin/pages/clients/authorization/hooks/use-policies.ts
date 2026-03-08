import { useQuery } from "@tanstack/react-query";
import {
    findPolicies,
    listDependentPolicies,
    listPolicyProviders
} from "../../../../api/client-authorization";
import { useAdminClient } from "../../../../app/admin-client";
import { authzKeys } from "./keys";

export function usePolicies(
    clientId: string,
    first: number,
    max: number,
    search: Record<string, unknown>
) {
    const { adminClient } = useAdminClient();
    return useQuery({
        queryKey: authzKeys.policies(clientId, first, max, search),
        queryFn: async () => {
            const policies = await findPolicies(
                adminClient,
                clientId,
                first,
                max + 1,
                search
            );

            return await Promise.all([
                listPolicyProviders(adminClient, clientId),
                ...(policies || []).map(async policy => {
                    const dependentPolicies = await listDependentPolicies(
                        adminClient,
                        clientId,
                        policy.id!
                    );

                    return {
                        ...policy,
                        dependentPolicies,
                        isExpanded: false
                    };
                })
            ]);
        }
    });
}
