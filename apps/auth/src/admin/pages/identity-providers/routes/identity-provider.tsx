import { generateEncodedPath } from "../../../shared/lib/generateEncodedPath";

export type IdentityProviderTab = "settings" | "mappers" | "permissions" | "events";

export type IdentityProviderParams = {
    realm: string;
    providerId: string;
    alias: string;
    tab: IdentityProviderTab;
};

export const toIdentityProvider = (params: IdentityProviderParams): string =>
    generateEncodedPath("/:realm/identity-providers/:providerId/:alias/:tab", params);
