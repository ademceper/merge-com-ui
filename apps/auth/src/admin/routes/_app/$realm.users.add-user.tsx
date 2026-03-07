import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";

const CreateUser = lazy(
    () => import("../../pages/user/create-user"),
);

export const Route = createFileRoute("/_app/$realm/users/add-user")({
    component: CreateUser,
});
