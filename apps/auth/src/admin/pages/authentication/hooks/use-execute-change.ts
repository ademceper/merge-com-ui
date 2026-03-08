import type AuthenticationFlowRepresentation from "@keycloak/keycloak-admin-client/lib/defs/authenticationFlowRepresentation";
import type AuthenticatorConfigRepresentation from "@keycloak/keycloak-admin-client/lib/defs/authenticatorConfigRepresentation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
    addExecutionToFlow,
    addFlowToFlow,
    deleteExecution,
    fetchConfig,
    lowerPriorityExecution,
    raisePriorityExecution,
    saveExecutionConfig
} from "../../../api/authentication";
import type { ExpandableExecution, IndexChange, LevelChange } from "../execution-model";
import { authenticationKeys } from "./keys";

type ExecuteChangeParams = {
    ex: AuthenticationFlowRepresentation | ExpandableExecution;
    change: LevelChange | IndexChange;
    flowAlias: string;
};

async function performExecuteChange(
    ex: AuthenticationFlowRepresentation | ExpandableExecution,
    change: LevelChange | IndexChange,
    flowAlias: string
): Promise<void> {
    let id = ex.id!;
    if ("parent" in change) {
        let config: AuthenticatorConfigRepresentation = {};
        if ("authenticationConfig" in ex) {
            config = await fetchConfig(ex.authenticationConfig as string);
        }

        try {
            await deleteExecution(id);
        } catch {
            // skipping already deleted execution
        }
        if ("authenticationFlow" in ex) {
            const executionFlow = ex as ExpandableExecution;
            const result = await addFlowToFlow({
                flow: change.parent?.displayName! || flowAlias,
                alias: executionFlow.displayName!,
                description: executionFlow.description!,
                provider: ex.providerId!,
                type: "basic-flow"
            });
            id = result.id!;
            if (executionFlow.executionList) {
                for (let i = 0; i < executionFlow.executionList.length; i++) {
                    await performExecuteChange(
                        executionFlow.executionList[i],
                        {
                            parent: { ...ex, id: result.id },
                            newIndex: i,
                            oldIndex: i
                        } as LevelChange,
                        flowAlias
                    );
                }
            }
        } else {
            const result = await addExecutionToFlow({
                flow: change.parent?.displayName! || flowAlias,
                provider: ex.providerId!
            });

            if (config.id) {
                await saveExecutionConfig({
                    config: undefined,
                    executionId: result.id!,
                    changedConfig: {
                        alias: config.alias,
                        config: config.config
                    }
                });
            }

            id = result.id!;
        }
    }
    const times = change.newIndex - change.oldIndex;
    for (let index = 0; index < Math.abs(times); index++) {
        if (times > 0) {
            await lowerPriorityExecution(id);
        } else {
            await raisePriorityExecution(id);
        }
    }
}

export function useExecuteChange() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ ex, change, flowAlias }: ExecuteChangeParams) =>
            performExecuteChange(ex, change, flowAlias),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: authenticationKeys.all
            });
        }
    });
}
