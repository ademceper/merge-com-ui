import { generateEncodedPath } from "../../../shared/lib/generateEncodedPath";

export type UserProfileTab =
    | "attributes"
    | "attributes-group"
    | "unmanaged-attributes"
    | "json-editor";

type UserProfileParams = {
    realm: string;
    tab: UserProfileTab;
};

export const toUserProfile = (params: UserProfileParams): string =>
    generateEncodedPath("/:realm/realm-settings/user-profile/:tab", params);
