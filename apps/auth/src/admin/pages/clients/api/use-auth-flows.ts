import type AuthenticationFlowRepresentation from "@keycloak/keycloak-admin-client/lib/defs/authenticationFlowRepresentation";
import { useQuery } from "@tanstack/react-query";
import { sortBy } from "lodash-es";
import { fetchAuthFlows } from "../../../api/clients";
import { useAdminClient } from "../../../app/admin-client";
import { clientKeys } from "./keys";

export function useAuthFlows() {
    const { adminClient } = useAdminClient();
    return useQuery({
        queryKey: clientKeys.authFlows(),
        queryFn: async () => {
            const flows = await fetchAuthFlows(adminClient);
            return sortBy(
                flows.filter(
                    (flow: AuthenticationFlowRepresentation) =>
                        flow.providerId !== "client-flow"
                ),
                [(f: AuthenticationFlowRepresentation) => f.alias]
            );
        }
    });
}
