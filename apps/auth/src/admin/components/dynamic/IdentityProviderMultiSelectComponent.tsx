/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/components/dynamic/IdentityProviderMultiSelectComponent.tsx"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import type { ComponentProps } from "./components";
import { IdentityProviderSelect } from "../identity-provider/IdentityProviderSelect";

export const IdentityProviderMultiSelectComponent = (props: ComponentProps) => (
    <IdentityProviderSelect
        {...props}
        convertToName={props.convertToName}
        name={props.name!}
    />
);
