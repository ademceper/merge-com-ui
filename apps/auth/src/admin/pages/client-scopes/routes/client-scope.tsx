import { generateEncodedPath } from "../../../shared/lib/generateEncodedPath";

export type ClientScopeTab = "settings" | "mappers" | "scope" | "events";

export type ClientScopeParams = {
    realm: string;
    id: string;
    tab: ClientScopeTab;
};

export const toClientScope = (params: ClientScopeParams): string =>
    generateEncodedPath("/:realm/client-scopes/:id/:tab", params);
