import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";

const EditUser = lazy(
    () => import("../../pages/user/edit-user"),
);

export const Route = createFileRoute("/_app/$realm/users/$id/$tab")({
    component: EditUser,
});
