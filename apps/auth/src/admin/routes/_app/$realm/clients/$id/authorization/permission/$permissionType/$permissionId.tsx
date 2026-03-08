import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";

const PermissionDetails = lazy(
    () => import("../../../../../../../../pages/clients/authorization/permission-details"),
);

export const Route = createFileRoute(
    "/_app/$realm/clients/$id/authorization/permission/$permissionType/$permissionId",
)({
    component: PermissionDetails,
});
