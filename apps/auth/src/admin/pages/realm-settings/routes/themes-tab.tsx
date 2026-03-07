import { generateEncodedPath } from "../../../shared/lib/generateEncodedPath";

export type ThemesTabType = "settings" | "lightColors" | "darkColors";

type ThemesParams = {
    realm: string;
    tab: ThemesTabType;
};

export const toThemesTab = (params: ThemesParams): string =>
    generateEncodedPath("/:realm/realm-settings/themes/:tab", params);
