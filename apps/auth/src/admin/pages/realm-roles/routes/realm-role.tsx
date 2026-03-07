import { generateEncodedPath } from "../../../shared/lib/generateEncodedPath";

export type RealmRoleTab =
    | "details"
    | "associated-roles"
    | "attributes"
    | "users-in-role"
    | "permissions"
    | "events";

type RealmRoleParams = {
    realm: string;
    id: string;
    tab: RealmRoleTab;
};

export const toRealmRole = (params: RealmRoleParams): string =>
    generateEncodedPath("/:realm/roles/:id/:tab", params);
