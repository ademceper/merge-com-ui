import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";

const ExecutorForm = lazy(
    () => import("../../../../../../../pages/realm-settings/executor-form"),
);

export const Route = createFileRoute(
    "/_app/$realm/realm-settings/client-policies/$profileName/edit-profile/$executorName",
)({
    component: ExecutorForm,
});
