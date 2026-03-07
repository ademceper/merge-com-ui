import { generateEncodedPath } from "../../../shared/lib/generateEncodedPath";

type IdentityProviderKubernetesParams = { realm: string };

const toIdentityProviderKubernetes = (
    params: IdentityProviderKubernetesParams
): string =>
    generateEncodedPath("/:realm/identity-providers/kubernetes/add", params);
