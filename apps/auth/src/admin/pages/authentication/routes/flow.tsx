import { generateEncodedPath } from "../../../shared/lib/generateEncodedPath";

export type FlowParams = {
    realm: string;
    id: string;
    usedBy: string;
    builtIn?: string;
};

export const toFlow = (params: FlowParams): string => {
    const path = params.builtIn
        ? "/:realm/authentication/:id/:usedBy/:builtIn"
        : "/:realm/authentication/:id/:usedBy";
    return generateEncodedPath(path, params as any);
};
