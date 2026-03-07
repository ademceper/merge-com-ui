import { generateEncodedPath } from "../../../shared/lib/generateEncodedPath";

export type AttributeParams = {
    realm: string;
    attributeName: string;
};

export const toAttribute = (params: AttributeParams): string =>
    generateEncodedPath("/:realm/realm-settings/user-profile/attributes/:attributeName/edit-attribute", params);
