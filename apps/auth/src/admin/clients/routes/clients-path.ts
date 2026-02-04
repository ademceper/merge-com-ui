/**
 * Clients route path helpers and types.
 * Split from Clients.tsx to avoid circular dependency: ClientsSection must not
 * import from the module that lazy-loads it.
 */

import type { Path } from "react-router-dom";
import { generateEncodedPath, type PathParams } from "../../utils/generateEncodedPath";

export type ClientsTab = "list" | "initial-access-token" | "client-registration";

export type ClientsParams = {
    realm: string;
    tab?: ClientsTab;
};

export const CLIENTS_PATH = "/:realm/clients";
export const CLIENTS_PATH_WITH_TAB = "/:realm/clients/:tab";

export const toClients = (params: ClientsParams): Partial<Path> => {
    const path = params.tab ? CLIENTS_PATH_WITH_TAB : CLIENTS_PATH;
    const pathParams = (params.tab
        ? { realm: params.realm, tab: params.tab }
        : { realm: params.realm }) as PathParams<typeof path>;
    return {
        pathname: generateEncodedPath(path, pathParams)
    };
};
