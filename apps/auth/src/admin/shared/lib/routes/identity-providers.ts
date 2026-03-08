import { generateEncodedPath } from "../generateEncodedPath";

type IdentityProvidersParams = { realm: string };

export const toIdentityProviders = (params: IdentityProvidersParams): string =>
    generateEncodedPath("/:realm/identity-providers", params);

export type IdentityProviderTab = "settings" | "mappers" | "permissions" | "events";

export type IdentityProviderParams = {
    realm: string;
    providerId: string;
    alias: string;
    tab: IdentityProviderTab;
};

export const toIdentityProvider = (params: IdentityProviderParams): string =>
    generateEncodedPath("/:realm/identity-providers/:providerId/:alias/:tab", params);

export type IdentityProviderCreateParams = {
    realm: string;
    providerId: string;
};

export const toIdentityProviderCreate = (params: IdentityProviderCreateParams): string =>
    generateEncodedPath("/:realm/identity-providers/:providerId/add", params);

export type IdentityProviderEditMapperParams = {
    realm: string;
    providerId: string;
    alias: string;
    id: string;
};

export const toIdentityProviderEditMapper = (
    params: IdentityProviderEditMapperParams
): string =>
    generateEncodedPath(
        "/:realm/identity-providers/:providerId/:alias/mappers/:id",
        params
    );

type IdentityProviderAddMapperParams = {
    realm: string;
    providerId: string;
    alias: string;
    tab: string;
};

export const toIdentityProviderAddMapper = (
    params: IdentityProviderAddMapperParams
): string =>
    generateEncodedPath(
        "/:realm/identity-providers/:providerId/:alias/:tab/create",
        params
    );
