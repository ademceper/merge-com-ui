import { generateEncodedPath } from "../../../shared/lib/generateEncodedPath";

export type EditAttributesGroupParams = {
    realm: string;
    name: string;
};

export const toEditAttributesGroup = (
    params: EditAttributesGroupParams
): string =>
    generateEncodedPath("/:realm/realm-settings/user-profile/attributesGroup/edit/:name", params);
