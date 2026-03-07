import { lazy } from "react";
import type { Path } from "react-router-dom";
import { generateEncodedPath } from "../../../shared/lib/generateEncodedPath";
import type { AppRouteObject } from "../../../app/routes";

export type EditClientPolicyParams = {
    realm: string;
    policyName: string;
};

const NewClientPolicy = lazy(() => import("../new-client-policy"));

export const EditClientPolicyRoute: AppRouteObject = {
    path: "/:realm/realm-settings/client-policies/:policyName/edit-policy",
    element: <NewClientPolicy />,
    breadcrumb: t => t("policyDetails"),
    handle: {
        access: "manage-realm"
    }
};

export const toEditClientPolicy = (params: EditClientPolicyParams): Partial<Path> => ({
    pathname: generateEncodedPath(EditClientPolicyRoute.path, params)
});
