import { lazy } from "react";
import type { Path } from "react-router-dom";
import { generateEncodedPath } from "../../../shared/lib/generateEncodedPath";
import type { AppRouteObject } from "../../../app/routes";

export type NewClientPolicyConditionParams = {
    realm: string;
    policyName: string;
};

const NewClientPolicyCondition = lazy(() => import("../new-client-policy-condition"));

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
