import { generateEncodedPath } from "../../../shared/lib/generateEncodedPath";

type CreateFlowParams = { realm: string };

export const toCreateFlow = (params: CreateFlowParams): string =>
    generateEncodedPath("/:realm/authentication/flows/create", params);
