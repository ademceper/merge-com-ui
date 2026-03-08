import { generateEncodedPath } from "../generate-encoded-path";

// Client Scopes list
type ClientScopesParams = { realm: string };

export const toClientScopes = (params: ClientScopesParams): string =>
    generateEncodedPath("/:realm/client-scopes", params);

// Client Scope detail
export type ClientScopeTab = "settings" | "mappers" | "scope" | "events";

export type ClientScopeParams = {
    realm: string;
    id: string;
    tab: ClientScopeTab;
};

export const toClientScope = (params: ClientScopeParams): string =>
    generateEncodedPath("/:realm/client-scopes/:id/:tab", params);

// Mapper
export type MapperParams = {
    realm: string;
    id: string;
    mapperId: string;
    viewMode: "edit" | "new";
};

export const toMapper = (params: MapperParams): string =>
    generateEncodedPath("/:realm/client-scopes/:id/mappers/:mapperId/:viewMode", params);
