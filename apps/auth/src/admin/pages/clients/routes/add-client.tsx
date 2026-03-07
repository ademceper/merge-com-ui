import { lazy } from "react";
import type { Path } from "react-router-dom";
import { generateEncodedPath } from "../../../shared/lib/generateEncodedPath";
import type { AppRouteObject } from "../../../app/routes";

export type AddClientParams = { realm: string };

const NewClientForm = lazy(() => import("../add/new-client-form"));

export const AddClientRoute: AppRouteObject = {
    path: "/:realm/clients/add-client",
    element: <NewClientForm />,
    breadcrumb: t => t("createClient"),
    handle: {
        access: "manage-clients"
    }
};

export const toAddClient = (params: AddClientParams): Partial<Path> => ({
    pathname: generateEncodedPath(AddClientRoute.path, params)
});
