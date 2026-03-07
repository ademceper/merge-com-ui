import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";

const ImportForm = lazy(
    () => import("../../pages/clients/import/import-form"),
);

export const Route = createFileRoute("/_app/$realm/clients/import-client")({
    component: ImportForm,
});
