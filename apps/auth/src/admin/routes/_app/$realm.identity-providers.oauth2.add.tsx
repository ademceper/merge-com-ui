import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";

const AddOAuth2 = lazy(
    () => import("../../pages/identity-providers/add/add-o-auth2"),
);

export const Route = createFileRoute(
    "/_app/$realm/identity-providers/oauth2/add",
)({
    component: AddOAuth2,
});
