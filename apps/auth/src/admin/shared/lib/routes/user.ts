import { generateEncodedPath } from "../generateEncodedPath";

// User
export type UserTab =
    | "settings"
    | "groups"
    | "organizations"
    | "consents"
    | "attributes"
    | "sessions"
    | "credentials"
    | "role-mapping"
    | "identity-provider-links"
    | "events";

export type UserParams = {
    realm: string;
    id: string;
    tab: UserTab;
};

export const toUser = (params: UserParams): string =>
    generateEncodedPath("/:realm/users/:id/:tab", params);

// Users
type UsersUserTab = "list" | "permissions";

type UsersParams = { realm: string; tab?: UsersUserTab };

export const toUsers = (params: UsersParams): string => {
    const path = params.tab ? "/:realm/users/:tab" : "/:realm/users";
    return generateEncodedPath(path, params as any);
};
