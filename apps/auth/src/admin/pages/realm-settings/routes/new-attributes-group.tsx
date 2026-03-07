import { generateEncodedPath } from "../../../shared/lib/generateEncodedPath";

type NewAttributesGroupParams = {
    realm: string;
};

export const toNewAttributesGroup = (
    params: NewAttributesGroupParams
): string =>
    generateEncodedPath("/:realm/realm-settings/user-profile/attributesGroup/new", params);
