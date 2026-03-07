import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";

const UsersSection = lazy(
    () => import("../../pages/user/users-section"),
);

export const Route = createFileRoute("/_app/$realm/users/$tab")({
    component: UsersSection,
});
