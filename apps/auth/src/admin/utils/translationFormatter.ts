/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/utils/translationFormatter.ts"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import { label } from "../../shared/keycloak-ui-shared";
import { TFunction } from "i18next";

type IFormatterValueType = string | number | boolean | null | undefined;
type IFormatter = (data?: IFormatterValueType) => string;

export const translationFormatter =
    (t: TFunction): IFormatter =>
    (data?: IFormatterValueType) => {
        return data ? label(t, data as string) || "—" : "—";
    };
