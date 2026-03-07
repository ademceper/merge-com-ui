import { lazy } from "react";
import type { Path } from "react-router-dom";
import { generateEncodedPath } from "../../../shared/lib/generateEncodedPath";
import type { AppRouteObject } from "../../../app/routes";

export type NewAttributesGroupParams = {
    realm: string;
};

const AttributesGroupDetails = lazy(
    () => import("../user-profile/attributes-group-details")
);

export const NewAttributesGroupRoute: AppRouteObject = {
    path: "/:realm/realm-settings/user-profile/attributesGroup/new",
    element: <AttributesGroupDetails />,
    breadcrumb: t => t("createGroupText"),
    handle: {
        access: "view-realm"
    }
};

export const toNewAttributesGroup = (
    params: NewAttributesGroupParams
): Partial<Path> => ({
    pathname: generateEncodedPath(NewAttributesGroupRoute.path, params)
});
