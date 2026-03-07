import { generateEncodedPath } from "../../../shared/lib/generateEncodedPath";

type IdentityProviderOidcParams = { realm: string };

const toIdentityProviderOidc = (
    params: IdentityProviderOidcParams
): string =>
    generateEncodedPath("/:realm/identity-providers/oidc/add", params);
