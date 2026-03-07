import { generateEncodedPath } from "../../../shared/lib/generateEncodedPath";

type IdentityProviderAddMapperParams = {
    realm: string;
    providerId: string;
    alias: string;
    tab: string;
};

export const toIdentityProviderAddMapper = (
    params: IdentityProviderAddMapperParams
): string =>
    generateEncodedPath("/:realm/identity-providers/:providerId/:alias/:tab/create", params);
