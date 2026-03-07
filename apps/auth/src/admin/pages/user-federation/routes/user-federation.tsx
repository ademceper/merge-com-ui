import { generateEncodedPath } from "../../../shared/lib/generateEncodedPath";

type UserFederationParams = { realm: string };

export const toUserFederation = (params: UserFederationParams): string =>
    generateEncodedPath("/:realm/user-federation", params);
