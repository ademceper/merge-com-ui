import { fetchWithError } from "@keycloak/keycloak-admin-client";
import type KeycloakAdminClient from "@keycloak/keycloak-admin-client";
import type AuthenticationFlowRepresentation from "@keycloak/keycloak-admin-client/lib/defs/authenticationFlowRepresentation";
import type AuthenticatorConfigInfoRepresentation from "@keycloak/keycloak-admin-client/lib/defs/authenticatorConfigInfoRepresentation";
import type AuthenticatorConfigRepresentation from "@keycloak/keycloak-admin-client/lib/defs/authenticatorConfigRepresentation";
import type { AuthenticationProviderRepresentation } from "@keycloak/keycloak-admin-client/lib/defs/authenticatorConfigRepresentation";
import type RealmRepresentation from "@keycloak/keycloak-admin-client/lib/defs/realmRepresentation";
import type RequiredActionConfigInfoRepresentation from "@keycloak/keycloak-admin-client/lib/defs/requiredActionConfigInfoRepresentation";
import type RequiredActionConfigRepresentation from "@keycloak/keycloak-admin-client/lib/defs/requiredActionConfigRepresentation";
import type RequiredActionProviderRepresentation from "@keycloak/keycloak-admin-client/lib/defs/requiredActionProviderRepresentation";
import type RequiredActionProviderSimpleRepresentation from "@keycloak/keycloak-admin-client/lib/defs/requiredActionProviderSimpleRepresentation";
import { sortBy } from "lodash-es";
import { getAuthorizationHeaders } from "../shared/lib/getAuthorizationHeaders";
import { addTrailingSlash } from "../shared/lib/util";
import { ExecutionList } from "../pages/authentication/execution-model";
import type { AuthenticationType } from "../pages/authentication/constants";

export type FlowType = "client" | "form" | "basic" | "condition" | "subFlow";

const providerConditionFilter = (value: AuthenticationProviderRepresentation) =>
    value.displayName?.startsWith("Condition ");

export type DataType = RequiredActionProviderRepresentation &
    RequiredActionProviderSimpleRepresentation & {
        configurable?: boolean;
    };

export type RequiredActionRow = {
    name?: string;
    enabled: boolean;
    defaultAction: boolean;
    data: DataType;
};

// --- Query functions ---

export async function fetchAuthenticationFlows(
    adminClient: KeycloakAdminClient,
    realm: string
) {
    const flowsRequest = await fetchWithError(
        `${addTrailingSlash(
            adminClient.baseUrl
        )}admin/realms/${realm}/ui-ext/authentication-management/flows`,
        {
            method: "GET",
            headers: getAuthorizationHeaders(await adminClient.getAccessToken())
        }
    );
    const data = await flowsRequest.json();
    if (!data) return [];
    return sortBy(
        [...data].sort((a: AuthenticationType, b: AuthenticationType) =>
            (a.alias ?? "").localeCompare(b.alias ?? "")
        ),
        (flow: AuthenticationType) => flow.usedBy?.type
    ) as AuthenticationType[];
}

export async function fetchFlowDetail(
    adminClient: KeycloakAdminClient,
    id: string
) {
    const flows = await adminClient.authenticationManagement.getFlows();
    const flow = flows.find(f => f.id === id);
    if (!flow) {
        throw new Error("Flow not found");
    }
    const executions = await adminClient.authenticationManagement.getExecutions({
        flow: flow.alias!
    });
    return { flow, executionList: new ExecutionList(executions) };
}

export async function fetchAuthenticationProviders(
    adminClient: KeycloakAdminClient
) {
    const [clientProviders, formActionProviders, authenticatorProviders] =
        await Promise.all([
            adminClient.authenticationManagement.getClientAuthenticatorProviders(),
            adminClient.authenticationManagement.getFormActionProviders(),
            adminClient.authenticationManagement.getAuthenticatorProviders()
        ]);
    return [
        ...clientProviders,
        ...formActionProviders,
        ...authenticatorProviders
    ] as AuthenticationProviderRepresentation[];
}

export async function fetchStepProviders(
    adminClient: KeycloakAdminClient,
    type: FlowType
) {
    switch (type) {
        case "client":
            return adminClient.authenticationManagement.getClientAuthenticatorProviders();
        case "form":
            return adminClient.authenticationManagement.getFormActionProviders();
        case "condition": {
            const providers =
                await adminClient.authenticationManagement.getAuthenticatorProviders();
            return providers.filter(providerConditionFilter);
        }
        default: {
            const providers =
                await adminClient.authenticationManagement.getAuthenticatorProviders();
            return providers.filter(
                (p: AuthenticationProviderRepresentation) =>
                    !providerConditionFilter(p)
            );
        }
    }
}

export async function fetchFormProviders(adminClient: KeycloakAdminClient) {
    return adminClient.authenticationManagement.getFormProviders();
}

export async function fetchFlowProviderId(
    adminClient: KeycloakAdminClient,
    flowId: string
) {
    const flow = await adminClient.authenticationManagement.getFlow({
        flowId
    });
    return flow.providerId;
}

export async function fetchExecutionConfig(
    adminClient: KeycloakAdminClient,
    execution: {
        id?: string;
        providerId?: string;
        authenticationConfig?: string;
        configurable?: boolean;
        authenticationFlow?: boolean;
        displayName?: string;
    }
) {
    const configDescription = execution.configurable
        ? await adminClient.authenticationManagement.getConfigDescription({
              providerId: execution.providerId!
          })
        : ({
              name: execution.displayName,
              properties: []
          } as AuthenticatorConfigInfoRepresentation);

    let config: AuthenticatorConfigRepresentation | undefined;
    if (execution.authenticationConfig) {
        config = await adminClient.authenticationManagement.getConfig({
            id: execution.authenticationConfig
        });
    }

    return { configDescription, config };
}

export async function fetchRequiredActionConfigData(
    adminClient: KeycloakAdminClient,
    alias: string
) {
    const configDescription =
        await adminClient.authenticationManagement.getRequiredActionConfigDescription(
            { alias }
        );
    const config =
        await adminClient.authenticationManagement.getRequiredActionConfig({
            alias
        });
    configDescription.properties = [...configDescription.properties!];
    return {
        configDescription,
        config
    } as {
        configDescription: RequiredActionConfigInfoRepresentation;
        config: RequiredActionConfigRepresentation;
    };
}

export async function fetchRequiredActions(
    adminClient: KeycloakAdminClient,
    realm: string
) {
    const requiredActionsRequest = await fetchWithError(
        `${addTrailingSlash(
            adminClient.baseUrl
        )}admin/realms/${realm}/ui-ext/authentication-management/required-actions`,
        {
            method: "GET",
            headers: getAuthorizationHeaders(await adminClient.getAccessToken())
        }
    );
    const requiredActions = (await requiredActionsRequest.json()) as DataType[];
    const unregisteredRequiredActions =
        await adminClient.authenticationManagement.getUnregisteredRequiredActions();

    return [
        ...requiredActions.map(action => ({
            name: action.name!,
            enabled: action.enabled!,
            defaultAction: action.defaultAction!,
            data: action
        })),
        ...unregisteredRequiredActions.map(action => ({
            name: action.name!,
            enabled: false,
            defaultAction: false,
            data: action
        }))
    ] as RequiredActionRow[];
}

// --- Mutation functions ---

export async function deleteFlow(
    adminClient: KeycloakAdminClient,
    flowId: string
) {
    return adminClient.authenticationManagement.deleteFlow({ flowId });
}

export async function copyFlow(
    adminClient: KeycloakAdminClient,
    params: {
        flow: string;
        newName: string;
        description?: string;
        originalDescription?: string;
    }
) {
    await adminClient.authenticationManagement.copyFlow({
        flow: params.flow,
        newName: params.newName
    });
    const newFlow = (await adminClient.authenticationManagement.getFlows()).find(
        f => f.alias === params.newName
    )!;
    if (params.description !== params.originalDescription) {
        newFlow.description = params.description;
        await adminClient.authenticationManagement.updateFlow(
            { flowId: newFlow.id! },
            newFlow
        );
    }
    return newFlow;
}

export async function updateFlow(
    adminClient: KeycloakAdminClient,
    params: {
        flow: AuthenticationFlowRepresentation;
        formValues: AuthenticationFlowRepresentation;
    }
) {
    return adminClient.authenticationManagement.updateFlow(
        { flowId: params.flow.id! },
        { ...params.flow, ...params.formValues }
    );
}

export async function createFlow(
    adminClient: KeycloakAdminClient,
    flow: AuthenticationFlowRepresentation
) {
    return adminClient.authenticationManagement.createFlow({
        ...flow,
        builtIn: false,
        topLevel: true
    });
}

export async function updateRequiredAction(
    adminClient: KeycloakAdminClient,
    params: {
        action: DataType;
        field: "enabled" | "defaultAction";
    }
) {
    const { action, field } = params;
    if (field in action) {
        action[field] = !action[field];
        delete action.configurable;
        await adminClient.authenticationManagement.updateRequiredAction(
            { alias: action.alias! },
            action
        );
    } else {
        await adminClient.authenticationManagement.registerRequiredAction({
            name: action.name,
            providerId: action.providerId
        });
    }
}

export async function updateExecution(
    adminClient: KeycloakAdminClient,
    params: {
        flowAlias: string;
        execution: Record<string, unknown>;
    }
) {
    return adminClient.authenticationManagement.updateExecution(
        { flow: params.flowAlias },
        params.execution as any
    );
}

export async function deleteExecution(
    adminClient: KeycloakAdminClient,
    id: string
) {
    return adminClient.authenticationManagement.delExecution({ id });
}

export async function addExecutionToFlow(
    adminClient: KeycloakAdminClient,
    params: { flow: string; provider: string }
) {
    return adminClient.authenticationManagement.addExecutionToFlow({
        flow: params.flow,
        provider: params.provider
    });
}

export async function addFlowToFlow(
    adminClient: KeycloakAdminClient,
    params: {
        flow: string;
        alias: string;
        description: string;
        provider: string;
        type: string;
    }
) {
    return adminClient.authenticationManagement.addFlowToFlow({
        flow: params.flow,
        alias: params.alias,
        description: params.description,
        provider: params.provider,
        type: params.type
    });
}

export async function saveExecutionConfig(
    adminClient: KeycloakAdminClient,
    params: {
        config?: AuthenticatorConfigRepresentation;
        executionId: string;
        changedConfig: { alias?: string; config?: Record<string, string> };
    }
) {
    const { config, executionId, changedConfig } = params;
    if (config) {
        const newConfig = {
            id: config.id,
            alias: config.alias,
            config: changedConfig.config
        };
        await adminClient.authenticationManagement.updateConfig(newConfig);
        return { ...newConfig };
    }
    const newConfig = {
        id: executionId,
        alias: changedConfig.alias,
        config: changedConfig.config
    };
    const { id } =
        await adminClient.authenticationManagement.createConfig(newConfig);
    return { ...newConfig.config, id, alias: newConfig.alias };
}

export async function deleteExecutionConfig(
    adminClient: KeycloakAdminClient,
    id: string
) {
    return adminClient.authenticationManagement.delConfig({ id });
}

export async function saveRequiredActionConfig(
    adminClient: KeycloakAdminClient,
    params: {
        alias: string;
        config: RequiredActionConfigRepresentation;
    }
) {
    return adminClient.authenticationManagement.updateRequiredActionConfig(
        { alias: params.alias },
        params.config
    );
}

export async function removeRequiredActionConfig(
    adminClient: KeycloakAdminClient,
    alias: string
) {
    return adminClient.authenticationManagement.removeRequiredActionConfig({
        alias
    });
}

export async function updateRealm(
    adminClient: KeycloakAdminClient,
    realm: string,
    realmData: RealmRepresentation
) {
    return adminClient.realms.update({ realm }, realmData);
}

export async function updateRealmWithRefetch(
    adminClient: KeycloakAdminClient,
    realm: string,
    realmData: RealmRepresentation
) {
    await adminClient.realms.update({ realm }, realmData);
    return adminClient.realms.findOne({ realm });
}
