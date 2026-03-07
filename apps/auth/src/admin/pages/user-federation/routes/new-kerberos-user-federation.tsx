import { generateEncodedPath } from "../../../shared/lib/generateEncodedPath";

type NewKerberosUserFederationParams = { realm: string };

const toNewKerberosUserFederation = (
    params: NewKerberosUserFederationParams
): string =>
    generateEncodedPath("/:realm/user-federation/kerberos/new", params);
