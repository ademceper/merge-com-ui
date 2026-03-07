import { generateEncodedPath } from "../../../shared/lib/generateEncodedPath";

type NewResourceParams = { realm: string; id: string };

export const toCreateResource = (params: NewResourceParams): string =>
    generateEncodedPath("/:realm/clients/:id/authorization/resource/new", params);
