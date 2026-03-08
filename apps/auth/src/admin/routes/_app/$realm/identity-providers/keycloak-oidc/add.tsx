import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";

const AddOpenIdConnect = lazy(
    () => import("../../../../../pages/identity-providers/add/add-open-id-connect"),
);

export const Route = createFileRoute(
    "/_app/$realm/identity-providers/keycloak-oidc/add",
)({
    component: AddOpenIdConnect,
});
