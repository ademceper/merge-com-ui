import { generateEncodedPath } from "../../../shared/lib/generateEncodedPath";

type IdentityProviderKeycloakOidcParams = { realm: string };

const toIdentityProviderKeycloakOidc = (
    params: IdentityProviderKeycloakOidcParams
): string =>
    generateEncodedPath("/:realm/identity-providers/keycloak-oidc/add", params);
