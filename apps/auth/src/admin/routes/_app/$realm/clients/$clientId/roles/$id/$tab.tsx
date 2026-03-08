import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";

const RealmRoleTabs = lazy(
    () => import("../../../../../../../pages/realm-roles/realm-role-tabs"),
);

export const Route = createFileRoute(
    "/_app/$realm/clients/$clientId/roles/$id/$tab",
)({
    component: RealmRoleTabs,
});
