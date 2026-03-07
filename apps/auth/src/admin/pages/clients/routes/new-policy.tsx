import { lazy } from "react";
import type { Path } from "react-router-dom";
import { generateEncodedPath } from "../../../shared/lib/generateEncodedPath";
import type { AppRouteObject } from "../../../app/routes";

export type NewPolicyParams = { realm: string; id: string; policyType: string };

const PolicyDetails = lazy(() => import("../authorization/policy/policy-details"));

export const NewPolicyRoute: AppRouteObject = {
    path: "/:realm/clients/:id/authorization/policy/new/:policyType",
    element: <PolicyDetails />,
    breadcrumb: t => t("createPolicy"),
    handle: {
        access: accessChecker =>
            accessChecker.hasAny("manage-clients", "manage-authorization")
    }
};

export const toCreatePolicy = (params: NewPolicyParams): Partial<Path> => ({
    pathname: generateEncodedPath(NewPolicyRoute.path, params)
});
