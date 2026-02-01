/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/Root.tsx"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import { KeycloakProvider } from "../shared/keycloak-ui-shared";

import { App } from "./App";
import { environment } from "./environment";

export const Root = () => (
    <KeycloakProvider environment={environment}>
        <App />
    </KeycloakProvider>
);
