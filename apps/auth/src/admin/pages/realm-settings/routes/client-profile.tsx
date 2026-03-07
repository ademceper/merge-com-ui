import { generateEncodedPath } from "../../../shared/lib/generateEncodedPath";

export type ClientProfileParams = {
    realm: string;
    profileName: string;
};

export const toClientProfile = (params: ClientProfileParams): string =>
    generateEncodedPath("/:realm/realm-settings/client-policies/:profileName/edit-profile", params);
