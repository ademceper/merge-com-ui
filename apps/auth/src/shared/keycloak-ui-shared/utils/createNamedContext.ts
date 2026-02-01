/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "shared/keycloak-ui-shared/utils/createNamedContext.ts"
 *
 * This file is provided by @keycloakify/keycloak-ui-shared version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import type { Context } from "react";
import { createContext } from "react";

export type NamedContext<T> = Context<T> & Required<Pick<Context<T>, "displayName">>;

export function createNamedContext<T>(displayName: string, defaultValue: T) {
    const context = createContext(defaultValue);
    context.displayName = displayName;
    return context as NamedContext<T>;
}
