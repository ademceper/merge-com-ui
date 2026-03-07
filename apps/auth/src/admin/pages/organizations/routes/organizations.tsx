import { lazy } from "react";
import type { Path } from "react-router-dom";
import type { AppRouteObject } from "../../../app/routes";
import { generateEncodedPath } from "../../../shared/lib/generateEncodedPath";

type OrganizationsRouteParams = {
    realm: string;
};

const OrganizationsSection = lazy(() => import("../organizations-section"));

export const OrganizationsRoute: AppRouteObject = {
    path: "/:realm/organizations",
    element: <OrganizationsSection />,
    breadcrumb: t => t("organizationsList"),
    handle: {
        access: "query-groups"
    }
};

export const toOrganizations = (params: OrganizationsRouteParams): Partial<Path> => {
    const path = OrganizationsRoute.path;

    return {
        pathname: generateEncodedPath(path, params)
    };
};
