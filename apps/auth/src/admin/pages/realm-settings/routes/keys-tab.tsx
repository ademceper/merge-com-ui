import { generateEncodedPath } from "../../../shared/lib/generateEncodedPath";

export type KeySubTab = "list" | "providers";

type KeysParams = {
    realm: string;
    tab: KeySubTab;
};

export const toKeysTab = (params: KeysParams): string =>
    generateEncodedPath("/:realm/realm-settings/keys/:tab", params);
