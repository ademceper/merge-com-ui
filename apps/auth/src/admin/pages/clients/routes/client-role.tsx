import { generateEncodedPath } from "../../../shared/lib/generateEncodedPath";

export type ClientRoleTab =
    | "details"
    | "attributes"
    | "users-in-role"
    | "associated-roles";

export type ClientRoleParams = {
    realm: string;
    clientId: string;
    id: string;
    tab: ClientRoleTab;
};

export const toClientRole = (params: ClientRoleParams): string =>
    generateEncodedPath("/:realm/clients/:clientId/roles/:id/:tab", params);
