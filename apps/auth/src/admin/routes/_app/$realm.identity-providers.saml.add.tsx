import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";

const AddSamlConnect = lazy(
    () => import("../../pages/identity-providers/add/add-saml-connect"),
);

export const Route = createFileRoute(
    "/_app/$realm/identity-providers/saml/add",
)({
    component: AddSamlConnect,
});
