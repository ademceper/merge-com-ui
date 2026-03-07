import { generateEncodedPath } from "../../../shared/lib/generateEncodedPath";

type IdentityProviderSamlParams = { realm: string };

const toIdentityProviderSaml = (
    params: IdentityProviderSamlParams
): string =>
    generateEncodedPath("/:realm/identity-providers/saml/add", params);
