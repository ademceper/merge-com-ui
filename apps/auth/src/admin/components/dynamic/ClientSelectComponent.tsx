/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/components/dynamic/ClientSelectComponent.tsx"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import type { ComponentProps } from "./components";
import { ClientSelect } from "../client/ClientSelect";

export const ClientSelectComponent = (props: ComponentProps) => (
    <ClientSelect {...props} name={props.convertToName(props.name!)} />
);
