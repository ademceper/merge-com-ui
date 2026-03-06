import type { AppRouteObject } from "../../routes";
import {
    CLIENT_REGISTRATION_PATH,
    type ClientRegistrationParams,
    type ClientRegistrationTab,
    toClientRegistration
} from "./client-registration-path";
import ClientsSection from "../ClientsSection";

export type { ClientRegistrationParams, ClientRegistrationTab };
export { toClientRegistration };

export const ClientRegistrationRoute: AppRouteObject = {
    path: CLIENT_REGISTRATION_PATH,
    element: <ClientsSection />,
    breadcrumb: t => t("clientRegistration"),
    handle: {
        access: "view-clients"
    }
};
