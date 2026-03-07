import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";

const AddIdentityProvider = lazy(
    () => import("../../pages/identity-providers/add/add-identity-provider"),
);

export const Route = createFileRoute(
    "/_app/$realm/identity-providers/$providerId/add",
)({
    component: AddIdentityProvider,
});
