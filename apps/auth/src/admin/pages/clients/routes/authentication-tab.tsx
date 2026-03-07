import { generateEncodedPath } from "../../../shared/lib/generateEncodedPath";

type AuthorizationTab =
    | "settings"
    | "resources"
    | "scopes"
    | "policies"
    | "permissions"
    | "evaluate"
    | "export";

type AuthorizationParams = {
    realm: string;
    clientId: string;
    tab: AuthorizationTab;
};

export const toAuthorizationTab = (params: AuthorizationParams): string =>
    generateEncodedPath("/:realm/clients/:clientId/authorization/:tab", params);
