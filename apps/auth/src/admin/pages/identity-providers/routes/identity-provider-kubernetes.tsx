import { lazy } from "react";
import type { Path } from "react-router-dom";
import { generateEncodedPath } from "../../../shared/lib/generateEncodedPath";
import type { AppRouteObject } from "../../../app/routes";

export type IdentityProviderKubernetesParams = { realm: string };

const AddKubernetesConnect = lazy(() => import("../add/add-kubernetes-connect"));

export const IdentityProviderKubernetesRoute: AppRouteObject = {
    path: "/:realm/identity-providers/kubernetes/add",
    element: <AddKubernetesConnect />,
    breadcrumb: t => t("addKubernetesProvider"),
    handle: {
        access: "manage-identity-providers"
    }
};

export const toIdentityProviderKubernetes = (
    params: IdentityProviderKubernetesParams
): Partial<Path> => ({
    pathname: generateEncodedPath(IdentityProviderKubernetesRoute.path, params)
});
