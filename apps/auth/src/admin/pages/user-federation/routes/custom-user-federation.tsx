import { generateEncodedPath } from "../../../shared/lib/generateEncodedPath";

export type CustomUserFederationRouteParams = {
    realm: string;
    providerId: string;
    id: string;
};

export const toCustomUserFederation = (
    params: CustomUserFederationRouteParams
): string =>
    generateEncodedPath("/:realm/user-federation/:providerId/:id", params);
