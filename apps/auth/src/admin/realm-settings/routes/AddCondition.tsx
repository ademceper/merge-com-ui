/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/realm-settings/routes/AddCondition.tsx"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import { lazy } from "react";
import type { Path } from "react-router-dom";
import { generateEncodedPath } from "../../utils/generateEncodedPath";
import type { AppRouteObject } from "../../routes";

export type NewClientPolicyConditionParams = {
    realm: string;
    policyName: string;
};

const NewClientPolicyCondition = lazy(() => import("../NewClientPolicyCondition"));

export const NewClientPolicyConditionRoute: AppRouteObject = {
    path: "/:realm/realm-settings/client-policies/:policyName/edit-policy/create-condition",
    element: <NewClientPolicyCondition />,
    breadcrumb: t => t("addCondition"),
    handle: {
        access: "manage-clients"
    }
};

export const toNewClientPolicyCondition = (
    params: NewClientPolicyConditionParams
): Partial<Path> => ({
    pathname: generateEncodedPath(NewClientPolicyConditionRoute.path, params)
});
