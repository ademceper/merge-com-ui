import type KeycloakAdminClient from "@keycloak/keycloak-admin-client";
import type WorkflowRepresentation from "@keycloak/keycloak-admin-client/lib/defs/workflowRepresentation";

export async function fetchWorkflows(adminClient: KeycloakAdminClient) {
    const list = await adminClient.workflows.find();
    return list.sort((a: WorkflowRepresentation, b: WorkflowRepresentation) =>
        (a.name ?? "").localeCompare(b.name ?? "")
    );
}

export async function fetchWorkflow(adminClient: KeycloakAdminClient, id: string) {
    return adminClient.workflows.findOne({ id, includeId: false });
}

export async function updateWorkflow(
    adminClient: KeycloakAdminClient,
    id: string,
    workflow: WorkflowRepresentation
) {
    return adminClient.workflows.update({ id }, workflow);
}

export async function createWorkflow(
    adminClient: KeycloakAdminClient,
    realm: string,
    yamlContent: string
) {
    return adminClient.workflows.createAsYaml({ realm, yaml: yamlContent });
}

export async function deleteWorkflow(adminClient: KeycloakAdminClient, id: string) {
    return adminClient.workflows.delById({ id });
}
