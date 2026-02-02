/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/clients/routes/ClientRegistration.tsx"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

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
