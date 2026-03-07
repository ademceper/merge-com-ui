import { generateEncodedPath } from "../../../shared/lib/generateEncodedPath";

type IdentityProviderJWTAuthorizationGrantParams = { realm: string };

const toIdentityProviderJWTAuthorizationGrant = (
    params: IdentityProviderJWTAuthorizationGrantParams
): string =>
    generateEncodedPath("/:realm/identity-providers/jwt-authorization-grant/add", params);
