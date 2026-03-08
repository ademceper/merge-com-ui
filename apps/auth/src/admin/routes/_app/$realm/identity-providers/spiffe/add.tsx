import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";

const AddSpiffeConnect = lazy(
    () => import("../../../../../pages/identity-providers/add/add-spiffe-connect"),
);

export const Route = createFileRoute(
    "/_app/$realm/identity-providers/spiffe/add",
)({
    component: AddSpiffeConnect,
});
