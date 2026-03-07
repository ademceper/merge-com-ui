import { generateEncodedPath } from "../../../shared/lib/generateEncodedPath";

export type ClientTab =
    | "settings"
    | "keys"
    | "credentials"
    | "roles"
    | "clientScopes"
    | "advanced"
    | "mappers"
    | "authorization"
    | "serviceAccount"
    | "permissions"
    | "sessions"
    | "events";

export type ClientParams = {
    realm: string;
    clientId: string;
    tab: ClientTab;
};

export const toClient = (params: ClientParams): string =>
    generateEncodedPath("/:realm/clients/:clientId/:tab", params);
