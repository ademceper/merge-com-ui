import { lazy } from "react";
import type { Path } from "react-router-dom";
import { generateEncodedPath } from "../../../shared/lib/generateEncodedPath";
import type { AppRouteObject } from "../../../app/routes";

export type EditClientPolicyConditionParams = {
    realm: string;
    policyName: string;
    conditionName: string;
};

const NewClientPolicyCondition = lazy(() => import("../new-client-policy-condition"));

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
