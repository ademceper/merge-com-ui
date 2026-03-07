import { generateEncodedPath } from "../../../shared/lib/generateEncodedPath";

export type WorkflowDetailParams = {
    realm: string;
    id: string;
    mode: "update" | "copy" | "create";
};

export const toWorkflowDetail = (params: WorkflowDetailParams): string =>
    generateEncodedPath("/:realm/workflows/:mode/:id", params);
