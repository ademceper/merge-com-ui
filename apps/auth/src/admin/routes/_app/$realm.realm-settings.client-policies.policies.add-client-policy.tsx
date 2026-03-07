import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";

const NewClientPolicy = lazy(
    () => import("../../pages/realm-settings/new-client-policy"),
);

export const Route = createFileRoute(
    "/_app/$realm/realm-settings/client-policies/policies/add-client-policy",
)({
    component: NewClientPolicy,
});
