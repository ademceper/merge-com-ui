import { lazy } from "react";
import type { Path } from "react-router-dom";
import { generateEncodedPath } from "../../../shared/lib/generateEncodedPath";
import type { AppRouteObject } from "../../../app/routes";

export type AddAttributeParams = {
    realm: string;
};

const NewAttributeSettings = lazy(() => import("../new-attribute-settings"));

export const AddAttributeRoute: AppRouteObject = {
    path: "/:realm/realm-settings/user-profile/attributes/add-attribute",
    element: <NewAttributeSettings />,
    breadcrumb: t => t("createAttribute"),
    handle: {
        access: "manage-realm"
    }
};

export const toAddAttribute = (params: AddAttributeParams): Partial<Path> => ({
    pathname: generateEncodedPath(AddAttributeRoute.path, params)
});
