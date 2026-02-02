/**
 * Clients route path helpers and types.
 * Split from Clients.tsx to avoid circular dependency: ClientsSection must not
 * import from the module that lazy-loads it.
 */

/* eslint-disable */
// @ts-nocheck

import type { Path } from "react-router-dom";
import { generateEncodedPath } from "../../utils/generateEncodedPath";

export type ClientsTab = "list" | "initial-access-token" | "client-registration";

export type ClientsParams = {
    realm: string;
    tab?: ClientsTab;
};

export const CLIENTS_PATH = "/:realm/clients";
export const CLIENTS_PATH_WITH_TAB = "/:realm/clients/:tab";

export const toClients = (params: ClientsParams): Partial<Path> => {
    const path = params.tab ? CLIENTS_PATH_WITH_TAB : CLIENTS_PATH;
    return {
        pathname: generateEncodedPath(path, params)
    };
};
