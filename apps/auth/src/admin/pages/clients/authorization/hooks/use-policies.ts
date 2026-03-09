import { useQuery } from "@tanstack/react-query";
import {
    findPolicies,
    listDependentPolicies,
    listPolicyProviders
} from "@/admin/api/client-authorization";
import { authzKeys } from "./keys";

export function usePolicies(
    clientId: string,
    first: number,
    max: number,
    search: Record<string, unknown>
) {
    return useQuery({
        queryKey: authzKeys.policies(clientId, first, max, search),
        queryFn: async () => {
            const policies = await findPolicies(
                clientId,
                first,
                max + 1,
                search
            );

            return await Promise.all([
                listPolicyProviders(clientId),
                ...(policies || []).map(async policy => {
                    const dependentPolicies = await listDependentPolicies(
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
