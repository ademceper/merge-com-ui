import { generateEncodedPath } from "../../../shared/lib/generateEncodedPath";

type NewCustomUserFederationRouteParams = {
    realm: string;
    providerId: string;
};

export const toNewCustomUserFederation = (
    params: NewCustomUserFederationRouteParams
): string =>
    generateEncodedPath("/:realm/user-federation/:providerId/new", params);
