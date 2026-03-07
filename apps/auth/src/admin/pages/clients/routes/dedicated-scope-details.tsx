import { generateEncodedPath } from "../../../shared/lib/generateEncodedPath";

export type DedicatedScopeTab = "mappers" | "scope";

export type DedicatedScopeDetailsParams = {
    realm: string;
    clientId: string;
    tab?: DedicatedScopeTab;
};

export const toDedicatedScope = (params: DedicatedScopeDetailsParams): string => {
    const path = params.tab
        ? "/:realm/clients/:clientId/clientScopes/dedicated/:tab"
        : "/:realm/clients/:clientId/clientScopes/dedicated";
    return generateEncodedPath(path, params as any);
};
