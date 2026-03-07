import { generateEncodedPath } from "../../../shared/lib/generateEncodedPath";

export type ProviderType =
    | "aes-generated"
    | "ecdsa-generated"
    | "hmac-generated"
    | "java-keystore"
    | "rsa"
    | "rsa-enc"
    | "rsa-enc-generated"
    | "rsa-generated";

export type KeyProviderParams = {
    id: string;
    providerType: ProviderType;
    realm: string;
};

export const toKeyProvider = (params: KeyProviderParams): string =>
    generateEncodedPath("/:realm/realm-settings/keys/providers/:id/:providerType/settings", params);
