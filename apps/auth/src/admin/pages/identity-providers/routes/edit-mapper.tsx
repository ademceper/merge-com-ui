import { generateEncodedPath } from "../../../shared/lib/generateEncodedPath";

export type IdentityProviderEditMapperParams = {
    realm: string;
    providerId: string;
    alias: string;
    id: string;
};

export const toIdentityProviderEditMapper = (
    params: IdentityProviderEditMapperParams
): string =>
    generateEncodedPath("/:realm/identity-providers/:providerId/:alias/mappers/:id", params);
