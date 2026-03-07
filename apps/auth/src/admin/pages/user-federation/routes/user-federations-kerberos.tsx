import { generateEncodedPath } from "../../../shared/lib/generateEncodedPath";

type UserFederationsKerberosParams = { realm: string };

const toUserFederationsKerberos = (
    params: UserFederationsKerberosParams
): string =>
    generateEncodedPath("/:realm/user-federation/kerberos", params);
