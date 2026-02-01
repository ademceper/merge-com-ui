/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/permissions-configuration/resource-types/ClientSelectComponent.tsx"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import { ClientSelect } from "../../components/client/ClientSelect";
import { ComponentProps } from "../../components/dynamic/components";

export const ClientSelectComponent = (props: ComponentProps) => (
    <ClientSelect {...props} clientKey="id" />
);
