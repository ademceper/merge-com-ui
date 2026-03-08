import { generateEncodedPath } from "../generate-encoded-path";

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
    if (params.tab) {
        return generateEncodedPath("/:realm/users/:tab", {
            realm: params.realm,
            tab: params.tab
        });
    }
    return generateEncodedPath("/:realm/users", { realm: params.realm });
};
