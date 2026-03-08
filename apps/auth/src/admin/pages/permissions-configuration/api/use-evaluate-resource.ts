import { useMutation } from "@tanstack/react-query";
import { evaluateResource } from "../../../api/permissions";
import { useAdminClient } from "../../../app/admin-client";

export function useEvaluateResource() {
    const { adminClient } = useAdminClient();
    return useMutation({
        mutationFn: ({
            clientId,
            realm,
            resEval
        }: {
            clientId: string;
            realm: string;
            resEval: import("@keycloak/keycloak-admin-client/lib/defs/resourceEvaluation").default;
        }) => evaluateResource(adminClient, clientId, realm, resEval)
    });
}
