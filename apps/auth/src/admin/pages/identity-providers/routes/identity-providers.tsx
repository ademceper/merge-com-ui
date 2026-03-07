import { generateEncodedPath } from "../../../shared/lib/generateEncodedPath";

type IdentityProvidersParams = { realm: string };

export const toIdentityProviders = (params: IdentityProvidersParams): string =>
    generateEncodedPath("/:realm/identity-providers", params);
