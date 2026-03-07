import { generateEncodedPath } from "../../../shared/lib/generateEncodedPath";

type WorkflowsParams = { realm: string };

export const toWorkflows = (params: WorkflowsParams): string =>
    generateEncodedPath("/:realm/workflows", params);
