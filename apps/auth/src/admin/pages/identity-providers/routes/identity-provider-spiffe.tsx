import { generateEncodedPath } from "../../../shared/lib/generateEncodedPath";

type IdentityProviderSpiffeParams = { realm: string };

const toIdentityProviderSpiffe = (
    params: IdentityProviderSpiffeParams
): string =>
    generateEncodedPath("/:realm/identity-providers/spiffe/add", params);
