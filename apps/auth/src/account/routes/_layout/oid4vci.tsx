import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";

const Oid4Vci = lazy(() => import("../../pages/oid4vci/oid4-vci"));

export const Route = createFileRoute("/_layout/oid4vci")({
    component: Oid4Vci
});
