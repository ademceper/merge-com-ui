import { generateEncodedPath } from "../../../shared/lib/generateEncodedPath";

export type MapperParams = {
    realm: string;
    id: string;
    mapperId: string;
    viewMode: "edit" | "new";
};

export const toMapper = (params: MapperParams): string =>
    generateEncodedPath("/:realm/client-scopes/:id/mappers/:mapperId/:viewMode", params);
