import { lazy } from "react";
import type { Path } from "react-router-dom";
import { generateEncodedPath } from "../../../shared/lib/generateEncodedPath";
import type { AppRouteObject } from "../../../app/routes";

export type PolicyDetailsParams = {
    realm: string;
    id: string;
    policyId: string;
    policyType: string;
};

const PolicyDetails = lazy(() => import("../authorization/policy/policy-details"));

export const PolicyDetailsRoute: AppRouteObject = {
    path: "/:realm/clients/:id/authorization/policy/:policyId/:policyType",
    element: <PolicyDetails />,
    breadcrumb: t => t("policyDetails"),
    handle: {
        access: accessChecker =>
            accessChecker.hasAny(
                "manage-clients",
                "view-authorization",
                "manage-authorization"
            )
    }
};

export const toPolicyDetails = (params: PolicyDetailsParams): Partial<Path> => ({
    pathname: generateEncodedPath(PolicyDetailsRoute.path, params)
});
