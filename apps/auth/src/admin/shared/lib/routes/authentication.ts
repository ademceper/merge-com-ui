import { generateEncodedPath } from "../generateEncodedPath";

export type AuthenticationTab = "flows" | "required-actions" | "policies";

type AuthenticationParams = { realm: string; tab?: AuthenticationTab };

export const toAuthentication = (params: AuthenticationParams): string => {
    const path = params.tab ? "/:realm/authentication/:tab" : "/:realm/authentication";
    return generateEncodedPath(path, params as any);
};

type CreateFlowParams = { realm: string };

export const toCreateFlow = (params: CreateFlowParams): string =>
    generateEncodedPath("/:realm/authentication/flows/create", params);

export type FlowParams = {
    realm: string;
    id: string;
    usedBy: string;
    builtIn?: string;
};

export const toFlow = (params: FlowParams): string => {
    const path = params.builtIn
        ? "/:realm/authentication/:id/:usedBy/:builtIn"
        : "/:realm/authentication/:id/:usedBy";
    return generateEncodedPath(path, params as any);
};
