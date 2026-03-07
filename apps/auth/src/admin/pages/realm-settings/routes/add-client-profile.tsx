import { generateEncodedPath } from "../../../shared/lib/generateEncodedPath";

type AddClientProfileParams = {
    realm: string;
    tab: string;
};

export const toAddClientProfile = (params: AddClientProfileParams): string =>
    generateEncodedPath("/:realm/realm-settings/client-policies/:tab/add-profile", params);
