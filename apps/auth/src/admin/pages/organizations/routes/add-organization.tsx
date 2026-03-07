import { lazy } from "react";
import type { Path } from "react-router-dom";
import { generateEncodedPath } from "../../../shared/lib/generateEncodedPath";
import type { AppRouteObject } from "../../../app/routes";

export type AddOrganizationParams = { realm: string };

const NewOrganization = lazy(() => import("../new-organization"));

export const AddOrganizationRoute: AppRouteObject = {
    path: "/:realm/organizations/new",
    element: <NewOrganization />,
    breadcrumb: t => t("createOrganization"),
    handle: {
        access: "manage-users"
    }
};

export const toAddOrganization = (params: AddOrganizationParams): Partial<Path> => ({
    pathname: generateEncodedPath(AddOrganizationRoute.path, params)
});
