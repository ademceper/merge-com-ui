import { useMutation } from "@tanstack/react-query";
import { evaluateResource } from "@/admin/api/permissions";

export function useEvaluateResource() {
    return useMutation({
        mutationFn: ({
            clientId,
            realm,
            resEval
        }: {
            clientId: string;
            realm: string;
            resEval: import("@keycloak/keycloak-admin-client/lib/defs/resourceEvaluation").default;
        }) => evaluateResource(clientId, realm, resEval)
    });
}
