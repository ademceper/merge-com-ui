import { generateEncodedPath } from "../../../shared/lib/generateEncodedPath";

type UserFederationKerberosParams = {
    realm: string;
    id: string;
};

export const toUserFederationKerberos = (
    params: UserFederationKerberosParams
): string =>
    generateEncodedPath("/:realm/user-federation/kerberos/:id", params);
