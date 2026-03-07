import { generateEncodedPath } from "../../../shared/lib/generateEncodedPath";

type ClientScopesParams = { realm: string };

export const toClientScopes = (params: ClientScopesParams): string =>
    generateEncodedPath("/:realm/client-scopes", params);
