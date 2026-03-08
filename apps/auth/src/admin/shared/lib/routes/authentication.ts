import { generateEncodedPath } from "../generate-encoded-path";

export type AuthenticationTab = "flows" | "required-actions" | "policies";

type AuthenticationParams = { realm: string; tab?: AuthenticationTab };

export const toAuthentication = (params: AuthenticationParams): string => {
    if (params.tab) {
        return generateEncodedPath("/:realm/authentication/:tab", {
            realm: params.realm,
            tab: params.tab
        });
    }
    return generateEncodedPath("/:realm/authentication", { realm: params.realm });
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
    if (params.builtIn) {
        return generateEncodedPath("/:realm/authentication/:id/:usedBy/:builtIn", {
            realm: params.realm,
            id: params.id,
            usedBy: params.usedBy,
            builtIn: params.builtIn
        });
    }
    return generateEncodedPath("/:realm/authentication/:id/:usedBy", {
        realm: params.realm,
        id: params.id,
        usedBy: params.usedBy
    });
};
