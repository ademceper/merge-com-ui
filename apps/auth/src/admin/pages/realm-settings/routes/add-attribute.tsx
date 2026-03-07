import { generateEncodedPath } from "../../../shared/lib/generateEncodedPath";

type AddAttributeParams = {
    realm: string;
};

export const toAddAttribute = (params: AddAttributeParams): string =>
    generateEncodedPath("/:realm/realm-settings/user-profile/attributes/add-attribute", params);
