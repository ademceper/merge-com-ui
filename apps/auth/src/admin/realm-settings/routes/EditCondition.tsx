/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/realm-settings/routes/EditCondition.tsx"
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

export type EditClientPolicyConditionParams = {
    realm: string;
    policyName: string;
    conditionName: string;
};

const NewClientPolicyCondition = lazy(() => import("../NewClientPolicyCondition"));

export const EditClientPolicyConditionRoute: AppRouteObject = {
    path: "/:realm/realm-settings/client-policies/:policyName/edit-policy/:conditionName/edit-condition",
    element: <NewClientPolicyCondition />,
    breadcrumb: t => t("editCondition"),
    handle: {
        access: "manage-clients"
    }
};

export const toEditClientPolicyCondition = (
    params: EditClientPolicyConditionParams
): Partial<Path> => ({
    pathname: generateEncodedPath(EditClientPolicyConditionRoute.path, params)
});
