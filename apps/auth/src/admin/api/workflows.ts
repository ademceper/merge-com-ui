import type WorkflowRepresentation from "@keycloak/keycloak-admin-client/lib/defs/workflowRepresentation";
import { adminClient } from "../app/admin-client";

export async function fetchWorkflows() {
    const list = await adminClient.workflows.find();
    return list.sort((a: WorkflowRepresentation, b: WorkflowRepresentation) =>
        (a.name ?? "").localeCompare(b.name ?? "")
    );
}

export async function fetchWorkflow(id: string) {
    return adminClient.workflows.findOne({ id, includeId: false });
}

export async function updateWorkflow(
    id: string,
    workflow: WorkflowRepresentation
) {
    return adminClient.workflows.update({ id }, workflow);
}

export async function createWorkflow(
    realm: string,
    yamlContent: string
) {
    return adminClient.workflows.createAsYaml({ realm, yaml: yamlContent });
}

export async function deleteWorkflow(id: string) {
    return adminClient.workflows.delById({ id });
}
