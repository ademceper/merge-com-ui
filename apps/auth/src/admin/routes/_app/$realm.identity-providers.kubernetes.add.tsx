import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";

const AddKubernetesConnect = lazy(
    () => import("../../pages/identity-providers/add/add-kubernetes-connect"),
);

export const Route = createFileRoute(
    "/_app/$realm/identity-providers/kubernetes/add",
)({
    component: AddKubernetesConnect,
});
