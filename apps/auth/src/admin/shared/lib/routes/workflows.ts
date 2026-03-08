import { generateEncodedPath } from "../generate-encoded-path";

type WorkflowsParams = { realm: string };

export const toWorkflows = (params: WorkflowsParams): string =>
    generateEncodedPath("/:realm/workflows", params);

export type WorkflowDetailParams = {
    realm: string;
    id: string;
    mode: "update" | "copy" | "create";
};

export const toWorkflowDetail = (params: WorkflowDetailParams): string =>
    generateEncodedPath("/:realm/workflows/:mode/:id", params);
