import { lazy } from "react";
import type { Path } from "react-router-dom";
import { generateEncodedPath } from "../../../shared/lib/generateEncodedPath";
import type { AppRouteObject } from "../../../app/routes";

export type EditAttributesGroupParams = {
    realm: string;
    name: string;
};

const AttributesGroupDetails = lazy(
    () => import("../user-profile/attributes-group-details")
);

export const EditAttributesGroupRoute: AppRouteObject = {
    path: "/:realm/realm-settings/user-profile/attributesGroup/edit/:name",
    element: <AttributesGroupDetails />,
    breadcrumb: t => t("editGroupText"),
    handle: {
        access: "view-realm"
    }
};

export const toEditAttributesGroup = (
    params: EditAttributesGroupParams
): Partial<Path> => ({
    pathname: generateEncodedPath(EditAttributesGroupRoute.path, params)
});
