import { generateEncodedPath } from "../../../shared/lib/generateEncodedPath";

type MapperParams = {
    realm: string;
    id: string;
    mapperId: string;
    viewMode: "edit" | "new";
};

export const toMapper = (params: MapperParams): string =>
    generateEncodedPath("/:realm/clients/:id/clientScopes/dedicated/mappers/:mapperId/:viewMode", params);
