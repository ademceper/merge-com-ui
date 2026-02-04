import type { AppRouteObject } from "../../routes";
import {
    CLIENTS_PATH,
    CLIENTS_PATH_WITH_TAB,
    type ClientsParams,
    type ClientsTab,
    toClients
} from "./clients-path";
import ClientsSection from "../ClientsSection";

export type { ClientsParams, ClientsTab };
export { toClients };

export const ClientsRoute: AppRouteObject = {
    path: CLIENTS_PATH,
    element: <ClientsSection />,
    breadcrumb: t => t("clientList"),
    handle: {
        access: "query-clients"
    }
};

export const ClientsRouteWithTab: AppRouteObject = {
    ...ClientsRoute,
    path: CLIENTS_PATH_WITH_TAB
};
