import { generateEncodedPath } from "../../../shared/lib/generateEncodedPath";

export type IdentityProviderCreateParams = {
    realm: string;
    providerId: string;
};

export const toIdentityProviderCreate = (
    params: IdentityProviderCreateParams
): string =>
    generateEncodedPath("/:realm/identity-providers/:providerId/add", params);
