/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "account/environment.ts"
 *
 * This file is provided by @keycloakify/keycloak-account-ui version 260502.0.2.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import {
    getInjectedEnvironment,
    type BaseEnvironment
} from "../../shared/keycloak-ui-shared";

export type Environment = BaseEnvironment & {
    /** The URL to the root of the account console. */
    baseUrl: string;
    /** The locale of the user */
    locale: string;
    /** Name of the referrer application in the back link */
    referrerName?: string;
    /** UR to the referrer application in the back link */
    referrerUrl?: string;
    /** Feature flags */
    features: Feature;
};

export type Feature = {
    isRegistrationEmailAsUsername: boolean;
    isEditUserNameAllowed: boolean;
    isLinkedAccountsEnabled: boolean;
    isMyResourcesEnabled: boolean;
    deleteAccountAllowed: boolean;
    updateEmailFeatureEnabled: boolean;
    updateEmailActionEnabled: boolean;
    isViewGroupsEnabled: boolean;
    isViewOrganizationsEnabled: boolean;
    isOid4VciEnabled: boolean;
};

export const environment = getInjectedEnvironment<Environment>();
