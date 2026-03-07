import { lazy } from "react";
import type { Path } from "react-router-dom";
import { generateEncodedPath } from "../../../shared/lib/generateEncodedPath";
import type { AppRouteObject } from "../../../app/routes";

export type CreateFlowParams = { realm: string };

const CreateFlow = lazy(() => import("../form/create-flow"));

export const CreateFlowRoute: AppRouteObject = {
    path: "/:realm/authentication/flows/create",
    element: <CreateFlow />,
    breadcrumb: t => t("createFlow"),
    handle: {
        access: "manage-authorization"
    }
};

export const toCreateFlow = (params: CreateFlowParams): Partial<Path> => ({
    pathname: generateEncodedPath(CreateFlowRoute.path, params)
});
