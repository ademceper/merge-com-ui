/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "account/content/fetchContent.ts"
 *
 * This file is provided by @keycloakify/keycloak-account-ui version 260502.0.2.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import type { CallOptions } from "../../shared/api/methods";
import type { MenuItem } from "../../widgets/page-nav";

export default async function fetchContentJson(opts: CallOptions): Promise<MenuItem[]> {
    const { content } = await import("../../shared/assets/content");
    return content;
}
